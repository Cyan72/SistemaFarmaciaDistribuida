// Inicia el replica set rs0 (idempotente: si ya existe, no hace nada).
const config = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 }, // preferido como PRIMARY
    { _id: 1, host: "mongo2:27018", priority: 1 },
    { _id: 2, host: "mongo3:27019", priority: 1 },
  ],
};

try {
  const estado = rs.status();
  print("Replica set ya iniciado: " + estado.set);
} catch (e) {
  print("Iniciando replica set rs0...");
  printjson(rs.initiate(config));
}

// Esperar a que haya un PRIMARY
let intentos = 0;
while (intentos < 30) {
  const hello = db.hello();
  if (hello.isWritablePrimary) break;
  sleep(1000);
  intentos++;
}

rs.status().members.forEach((m) => print(m.name + " -> " + m.stateStr));
