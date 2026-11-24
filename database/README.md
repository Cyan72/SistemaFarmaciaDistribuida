
# Modulo de Base de Datos y CRUD

## 1. Descripcion

Este modulo implementa la estructura de datos
del Sistema de Farmacia Distribuida utilizando
MongoDB 8.0 y un Replica Set de tres nodos.

Incluye colecciones, indices, validaciones,
datos iniciales, operaciones CRUD y pruebas.

## 2. Requisitos

- Docker Desktop.
- Docker Compose.
- Git.
- Visual Studio Code (opcional).

## 3. Archivos del modulo

| Archivo | Funcion |
|---|---|
| modelo.md | Modelo conceptual y logico |
| colecciones.js | Creacion de colecciones |
| indices.js | Creacion de indices |
| validaciones.js | Validacion de documentos |
| datos_iniciales.js | Carga de datos de prueba |
| consultas.js | Operaciones CRUD |
| pruebas.js | Pruebas de funcionamiento |

## 4. Iniciar la infraestructura

Desde la carpeta principal del repositorio:

```bash
docker compose up -d
```

Verificar los contenedores:

```bash
docker compose ps -a
```

Comprobar el estado del Replica Set:

```bash
docker exec mongo1 mongosh --port 27017 --quiet --eval "rs.status().members.map(m => ({nombre:m.name, estado:m.stateStr}))"
```

Debe existir un nodo PRIMARY y dos SECONDARY.

## 5. Configurar la base de datos

Los siguientes comandos asumen que mongo1
es el nodo PRIMARY.

### Crear colecciones

```bash
docker exec mongo1 mongosh --port 27017 --quiet /database/colecciones.js
```

### Crear indices

```bash
docker exec mongo1 mongosh --port 27017 --quiet /database/indices.js
```

### Configurar validaciones

```bash
docker exec mongo1 mongosh --port 27017 --quiet /database/validaciones.js
```

### Insertar datos iniciales

```bash
docker exec mongo1 mongosh --port 27017 --quiet /database/datos_iniciales.js
```

## 6. Ejecutar operaciones CRUD

Solo en un entorno local de demostracion,
ya que este script modifica datos de prueba.

```bash
docker exec mongo1 mongosh --port 27017 --quiet /database/consultas.js
```

El script permite demostrar:

- Registro de medicamentos.
- Consulta de medicamentos.
- Actualizacion de precios.
- Eliminacion de registros de prueba.
- Consulta de inventario por sucursal.
- Actualizacion de stock.
- Consulta de stock bajo.

## 7. Ejecutar pruebas

Ejecutar despues del CRUD, utilizando los
datos iniciales del entorno de demostracion.

```bash
docker exec mongo1 mongosh --port 27017 --quiet /database/pruebas.js
```

Resultados obtenidos:

- Pruebas aprobadas: 13.
- Pruebas fallidas: 0.
- Rechazo de codigos duplicados.
- Rechazo de inventarios duplicados.
- Integridad de referencias comprobada.

## 8. Verificar replicacion

Consultar la cantidad de medicamentos
en el segundo nodo:

```bash
docker exec mongo2 mongosh "mongodb://localhost:27018/farmacia?directConnection=true&readPreference=secondary" --quiet --eval "db.medicamentos.countDocuments({})"
```

Consultar el tercer nodo:

```bash
docker exec mongo3 mongosh "mongodb://localhost:27019/farmacia?directConnection=true&readPreference=secondary" --quiet --eval "db.medicamentos.countDocuments({})"
```

Resultado esperado con los datos iniciales:
10 medicamentos en cada nodo.

## 9. Datos iniciales

| Coleccion | Documentos iniciales |
|---|---:|
| medicamentos | 10 |
| sedes | 3 |
| inventario | 30 |
| ventas | 0 |
| eventos | 0 |

## 10. Integracion

La base de datos utilizada es farmacia.

Los modulos de ventas y procesamiento de
datos deben respetar los campos y tipos
documentados en modelo.md.

Los esquemas de ventas y eventos estan
pendientes de coordinacion con el equipo.

## 11. Detener los contenedores

```bash
docker compose down
```

Los datos se conservan en los volumenes
persistentes de Docker.
