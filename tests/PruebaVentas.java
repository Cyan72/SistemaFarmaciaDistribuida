package tests;

import conexion.ConexionMongo;
import app.GestorVentas;
import app.GestorVentas.StockInsuficienteException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.ReplaceOptions;
import org.bson.Document;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class PruebaVentas {

    static final String MED = "MED-TEST";
    static final String SEDE = "SEDE-TEST";

    public static void main(String[] args) throws Exception {
        try (MongoClient client = ConexionMongo.getCliente()) {
            GestorVentas gestor = new GestorVentas(client);
            var db = client.getDatabase("farmacia");

            // Venta valida completa
            resetStock(client, 10);
            gestor.vender(MED, SEDE, 3, 5.0);
            check("venta valida descuenta stock", stock(client) == 7);
            check("venta valida registra venta",
                db.getCollection("ventas").countDocuments(Filters.eq("medicamento_id", MED)) >= 1);

            // Error sin cambios parciales
            resetStock(client, 2);
            long ventasAntes = db.getCollection("ventas").countDocuments();
            long eventosAntes = db.getCollection("eventos").countDocuments();
            boolean fallo = false;
            try {
                gestor.vender(MED, SEDE, 5, 5.0);
            } catch (StockInsuficienteException e) {
                fallo = true;
            }
            check("stock insuficiente lanza error", fallo);
            check("sin cambios en stock", stock(client) == 2);
            check("sin venta parcial", db.getCollection("ventas").countDocuments() == ventasAntes);
            check("sin evento parcial", db.getCollection("eventos").countDocuments() == eventosAntes);

            // Dos compradores simultaneos, stock = 1
            resetStock(client, 1);
            ExecutorService pool = Executors.newFixedThreadPool(2);
            CountDownLatch inicio = new CountDownLatch(1);
            AtomicInteger ok = new AtomicInteger();
            AtomicInteger rechazadas = new AtomicInteger();
            for (int i = 0; i < 2; i++) {
                pool.submit(() -> {
                    try {
                        inicio.await();
                        gestor.vender(MED, SEDE, 1, 5.0);
                        ok.incrementAndGet();
                    } catch (StockInsuficienteException e) {
                        rechazadas.incrementAndGet();
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }
            inicio.countDown();
            pool.shutdown();
            pool.awaitTermination(30, TimeUnit.SECONDS);

            check("concurrencia: 1 venta exitosa", ok.get() == 1);
            check("concurrencia: 1 rechazada", rechazadas.get() == 1);
            check("concurrencia: stock final 0", stock(client) == 0);
        }
    }

    static void resetStock(MongoClient client, int stock) {
        client.getDatabase("farmacia").getCollection("inventario").replaceOne(
            Filters.and(Filters.eq("medicamento_id", MED), Filters.eq("sede_id", SEDE)),
            new Document("medicamento_id", MED).append("sede_id", SEDE).append("stock", stock),
            new ReplaceOptions().upsert(true));
    }

    static int stock(MongoClient client) {
        Document d = client.getDatabase("farmacia").getCollection("inventario").find(
            Filters.and(Filters.eq("medicamento_id", MED), Filters.eq("sede_id", SEDE))).first();
        return d.getInteger("stock");
    }

    static void check(String nombre, boolean cond) {
        System.out.println((cond ? "[OK]   " : "[FAIL] ") + nombre);
    }
}
