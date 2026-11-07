
package conexion;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.ReadConcern;
import com.mongodb.ReadPreference;
import com.mongodb.WriteConcern;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import java.util.concurrent.TimeUnit;

/**
 * Conexión al replica set rs0 de la farmacia.
 * El driver descubre el PRIMARY y, si cae, se reconecta solo al nuevo líder.
 */
public final class ConexionMongo {

    // Puede sobreescribirse con la variable de entorno MONGO_URI
    private static final String URI_POR_DEFECTO =
            "mongodb://mongo1:27017,mongo2:27018,mongo3:27019/?replicaSet=rs0";

    private static MongoClient cliente;

    private ConexionMongo() {}

    public static synchronized MongoClient getCliente() {
        if (cliente == null) {
            String uri = System.getenv().getOrDefault("MONGO_URI", URI_POR_DEFECTO);

            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(uri))
                    .writeConcern(WriteConcern.MAJORITY.withWTimeout(5, TimeUnit.SECONDS))
                    .readConcern(ReadConcern.MAJORITY)
                    .readPreference(ReadPreference.primary())
                    .retryWrites(true)
                    .retryReads(true)
                    .applyToClusterSettings(b -> b.serverSelectionTimeout(15, TimeUnit.SECONDS))
                    .applyToSocketSettings(b -> b.connectTimeout(5, TimeUnit.SECONDS))
                    .build();

            cliente = MongoClients.create(settings);
        }
        return cliente;
    }

    public static MongoDatabase getBaseDatos() {
        return getCliente().getDatabase("farmacia");
    }

    public static synchronized void cerrar() {
        if (cliente != null) {
            cliente.close();
            cliente = null;
        }
    }
}
