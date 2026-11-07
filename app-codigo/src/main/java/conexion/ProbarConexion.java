
package conexion;

import org.bson.Document;

/** verificar que Java ve el replica set rs0. */
public class ProbarConexion {
    public static void main(String[] args) {
        try {
            System.out.println("=== Farmacia: prueba de conexion Java ===");
            Document ping = ConexionMongo.getBaseDatos()
                    .runCommand(new Document("ping", 1));
            Document hello = ConexionMongo.getBaseDatos()
                    .runCommand(new Document("hello", 1));

            System.out.println("Ping: " + ping.get("ok"));
            String conjunto = hello.getString("setName");
            System.out.println("Replica Set: " + conjunto);
            System.out.println("Nodos anunciados: " + hello.get("hosts"));
            System.out.println("El nodo que respondio es PRIMARY: "
                    + hello.get("isWritablePrimary"));

            if (!"rs0".equals(conjunto)) {
                throw new IllegalStateException("Se esperaba el Replica Set rs0");
            }
            System.out.println("CONEXION CORRECTA: Java accede a MongoDB.");
        } catch (Exception e) {
            System.err.println("FALLO DE CONEXION: " + e.getMessage());
            throw new RuntimeException("La prueba de conexion no paso", e);
        } finally {
            ConexionMongo.cerrar();
        }
    }
}
