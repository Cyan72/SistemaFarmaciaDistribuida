package app;

import com.mongodb.ReadConcern;
import com.mongodb.TransactionOptions;
import com.mongodb.WriteConcern;
import com.mongodb.client.ClientSession;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.Date;
import java.util.concurrent.TimeUnit;

public class GestorVentas {

    public static class StockInsuficienteException extends RuntimeException {
        public StockInsuficienteException(String msg) { super(msg); }
    }

    public static class DeadlineException extends RuntimeException {
        public DeadlineException(String msg) { super(msg); }
    }

    private static final long DEADLINE_MS = 5000;

    private final MongoClient client;
    private final MongoCollection<Document> inventario;
    private final MongoCollection<Document> ventas;
    private final MongoCollection<Document> eventos;

    public GestorVentas(MongoClient client) {
        this.client = client;
        var db = client.getDatabase(ConexionMongo.DB);
        this.inventario = db.getCollection("inventario");
        this.ventas = db.getCollection("ventas");
        this.eventos = db.getCollection("eventos");
    }

    public ObjectId vender(String medicamentoId, String sedeId, int cantidad, double precioUnitario) {
        if (cantidad <= 0) throw new IllegalArgumentException("cantidad invalida");

        TransactionOptions opts = TransactionOptions.builder()
            .readConcern(ReadConcern.SNAPSHOT)
            .writeConcern(WriteConcern.MAJORITY)
            .maxCommitTime(DEADLINE_MS, TimeUnit.MILLISECONDS)
            .build();

        final long limite = System.currentTimeMillis() + DEADLINE_MS;

        try (ClientSession session = client.startSession()) {
            return session.withTransaction(() -> {
                verificarDeadline(limite);

                // 1. validar + 2. descontar (atomico, protege ante concurrencia)
                UpdateResult r = inventario.updateOne(session,
                    Filters.and(
                        Filters.eq("medicamento_id", medicamentoId),
                        Filters.eq("sede_id", sedeId),
                        Filters.gte("stock", cantidad)),
                    Updates.inc("stock", -cantidad));

                if (r.getModifiedCount() == 0) {
                    throw new StockInsuficienteException(
                        "Stock insuficiente: " + medicamentoId + " en " + sedeId);
                }

                verificarDeadline(limite);

                // 3. registrar venta
                ObjectId ventaId = new ObjectId();
                ventas.insertOne(session, new Document("_id", ventaId)
                    .append("medicamento_id", medicamentoId)
                    .append("sede_id", sedeId)
                    .append("cantidad", cantidad)
                    .append("total", cantidad * precioUnitario)
                    .append("fecha", new Date()));

                // 4. registrar evento
                eventos.insertOne(session, new Document("tipo", "VENTA")
                    .append("venta_id", ventaId)
                    .append("medicamento_id", medicamentoId)
                    .append("sede_id", sedeId)
                    .append("cantidad", cantidad)
                    .append("fecha", new Date()));

                return ventaId; // COMMIT
            }, opts);
        }
        // Cualquier excepcion => ROLLBACK automatico
    }

    private void verificarDeadline(long limite) {
        if (System.currentTimeMillis() > limite) {
            throw new DeadlineException("Deadline excedido");
        }
    }
}
