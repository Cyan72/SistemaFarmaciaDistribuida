const farmacia = db.getSiblingDB("farmacia");

print("\n=== 1. CREATE ===");

if (!farmacia.medicamentos.findOne({ codigo: "MED011" })) {

    const resultado = farmacia.medicamentos.insertOne({
        codigo: "MED011",
        nombre: "Medicamento de prueba",
        categoria: "Pruebas",
        precio: NumberDecimal("3.50"),
        activo: true
    });

    printjson(resultado);

} else {
    print("El medicamento de prueba ya existe.");
}

print("\n=== 2. READ ===");

printjson(
    farmacia.medicamentos.findOne({
        codigo: "MED011"
    })
);

print("\n=== 3. UPDATE ===");

printjson(
    farmacia.medicamentos.updateOne(
        { codigo: "MED011" },
        {
            $set: {
                precio: NumberDecimal("4.00")
            }
        }
    )
);

printjson(
    farmacia.medicamentos.findOne({
        codigo: "MED011"
    })
);

print("\n=== 4. DELETE ===");

printjson(
    farmacia.medicamentos.deleteOne({
        codigo: "MED011",
        categoria: "Pruebas"
    })
);

print("Medicamento eliminado.");

print("\n=== 5. MEDICAMENTOS ACTIVOS ===");

printjson(
    farmacia.medicamentos.find(
        { activo: true },
        { _id: 0, codigo: 1, nombre: 1, precio: 1 }
    ).toArray()
);

print("\n=== 6. INVENTARIO POR SEDE ===");

const sede = farmacia.sedes.findOne({
    codigo: "SED001"
});

const medicamento = farmacia.medicamentos.findOne({
    codigo: "MED001"
});

if (!sede || !medicamento) {
    throw new Error("Ejecutar primero datos_iniciales.js");
}

print("Sucursal: " + sede.nombre);

printjson(
    farmacia.inventario.aggregate([
        {
            $match: {
                sede_id: sede._id
            }
        },
        {
            $lookup: {
                from: "medicamentos",
                localField: "medicamento_id",
                foreignField: "_id",
                as: "medicamento"
            }
        },
        {
            $unwind: "$medicamento"
        },
        {
            $project: {
                _id: 0,
                codigo: "$medicamento.codigo",
                nombre: "$medicamento.nombre",
                stock: 1,
                stock_minimo: 1
            }
        }
    ]).toArray()
);

print("\n=== 7. ACTUALIZACION DE STOCK ===");

const filtro = {
    medicamento_id: medicamento._id,
    sede_id: sede._id
};

print("Stock anterior:");

printjson(
    farmacia.inventario.findOne(filtro)
);

printjson(
    farmacia.inventario.updateOne(
        filtro,
        {
            $set: {
                stock: NumberInt(120),
                fecha_actualizacion: new Date()
            }
        }
    )
);

print("Stock actualizado:");

printjson(
    farmacia.inventario.findOne(filtro)
);

print("\n=== 8. MEDICAMENTOS CON STOCK BAJO ===");

printjson(
    farmacia.inventario.find({
        $expr: {
            $lte: ["$stock", "$stock_minimo"]
        }
    }).toArray()
);

print("\n=== OPERACIONES FINALIZADAS ===");
