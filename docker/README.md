# Infraestructura Docker — Farmacia

**Responsable:** Integrante 1

## Descripción

Configuración de un clúster MongoDB 8 mediante Docker Compose, compuesto por tres nodos pertenecientes al Replica Set `rs0`.

La infraestructura permite replicación de documentos, elección automática de un nuevo PRIMARY y reincorporación de nodos.

## Componentes

- `compose.yaml`: define los contenedores, la red, los puertos y los volúmenes persistentes.
- `docker/iniciar_rs.js`: inicializa el Replica Set automáticamente.
- `app-codigo/`: contiene la conexión y prueba de comunicación mediante Java 21.

## Ejecución

Desde la raíz del repositorio:

```powershell
docker compose up -d
```

Verificar los contenedores:

```powershell
docker compose ps -a
```

Comprobar la conexión Java:

```powershell
docker compose run --rm java-prueba
```

## Pruebas realizadas

- Tres nodos MongoDB operativos.
- Replica Set `rs0` inicializado.
- Replicación comprobada entre PRIMARY y SECONDARY.
- Failover automático y recuperación del nodo.
- Conexión satisfactoria con Java 21.

## Consideraciones

El entorno está destinado a prácticas locales y no tiene autenticación configurada. No debe exponerse directamente a Internet.

Los volúmenes permiten conservar los datos entre reinicios normales. Evitar `docker compose down -v` si se desean mantener.