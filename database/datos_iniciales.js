const farmacia = db.getSiblingDB("farmacia");


const sedes = [
    {
        codigo: "SED001",
        nombre: "Farmacia Arequipa Centro",
        ciudad: "Arequipa",
        direccion: "Cercado",
        activo: true
    },
    {
        codigo: "SED002",
        nombre: "Farmacia Cayma",
        ciudad: "Arequipa",
        direccion: "Cayma",
        activo: true
    },
    {
        codigo: "SED003",
        nombre: "Farmacia Cerro Colorado",
        ciudad: "Arequipa",
        direccion: "Cerro Colorado",
        activo: true
    }
];

sedes.forEach(function(sede) {
    farmacia.sedes.updateOne(
        { codigo: sede.codigo },
        { $setOnInsert: sede },
        { upsert: true }
    );
});

print("Sedes registradas correctamente.");

const medicamentos = [
    {
        codigo: "MED001",
        nombre: "Paracetamol",
        categoria: "Analgesicos",
        precio: NumberDecimal("1.00"),
        activo: true
    },
    {
        codigo: "MED002",
        nombre: "Ibuprofeno",
        categoria: "Antiinflamatorios",
        precio: NumberDecimal("1.50"),
        activo: true
    },
    {
        codigo: "MED003",
        nombre: "Amoxicilina",
        categoria: "Antibioticos",
        precio: NumberDecimal("2.50"),
        activo: true
    },
    {
        codigo: "MED004",
        nombre: "Loratadina",
        categoria: "Antihistaminicos",
        precio: NumberDecimal("1.20"),
        activo: true
    },
    {
        codigo: "MED005",
        nombre: "Omeprazol",
        categoria: "Gastrointestinales",
        precio: NumberDecimal("1.80"),
        activo: true
    },
    {
        codigo: "MED006",
        nombre: "Metformina",
        categoria: "Antidiabeticos",
        precio: NumberDecimal("2.00"),
        activo: true
    },
    {
        codigo: "MED007",
        nombre: "Naproxeno",
        categoria: "Antiinflamatorios",
        precio: NumberDecimal("1.50"),
        activo: true
    },
    {
        codigo: "MED008",
        nombre: "Cetirizina",
        categoria: "Antihistaminicos",
        precio: NumberDecimal("1.30"),
        activo: true
    },
    {
        codigo: "MED009",
        nombre: "Vitamina C",
        categoria: "Vitaminas",
        precio: NumberDecimal("2.00"),
        activo: true
    },
    {
        codigo: "MED010",
        nombre: "Losartan",
        categoria: "Antihipertensivos",
        precio: NumberDecimal("2.20"),
        activo: true
    }
];

medicamentos.forEach(function(medicamento) {
    farmacia.medicamentos.updateOne(
        { codigo: medicamento.codigo },
        { $setOnInsert: medicamento },
        { upsert: true }
    );
});

print("Medicamentos registrados correctamente.");

sedes.forEach(function(sede, i) {

    const sedeDB = farmacia.sedes.findOne(
        { codigo: sede.codigo }
    );

    medicamentos.forEach(function(medicamento, j) {

        const medicamentoDB =
            farmacia.medicamentos.findOne(
                { codigo: medicamento.codigo }
            );

        farmacia.inventario.updateOne(
            {
                medicamento_id: medicamentoDB._id,
                sede_id: sedeDB._id
            },
            {
                $setOnInsert: {
                    stock: NumberInt(100 + i * 20 + j * 5),
                    stock_minimo: NumberInt(10),
                    fecha_actualizacion: new Date()
                }
            },
            { upsert: true }
        );
    });
});

print("Inventario registrado correctamente.");

print("\n=== RESUMEN DE LA BASE DE DATOS ===");

print("Sedes: " +
    farmacia.sedes.countDocuments({}));

print("Medicamentos: " +
    farmacia.medicamentos.countDocuments({}));

print("Inventarios: " +
    farmacia.inventario.countDocuments({}));

print("Ventas: " +
    farmacia.ventas.countDocuments({}));

print("Eventos: " +
    farmacia.eventos.countDocuments({}));

print("\nCarga inicial finalizada correctamente.");
