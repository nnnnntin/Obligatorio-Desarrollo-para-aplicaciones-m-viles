const mongoose = require("mongoose");

const espacioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['oficina', 'sala_reunion', 'escritorio_flexible', 'otro'] },
    ubicacion: {
      edificioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Edificio' },
      piso: { type: Number },
      sector: { type: String },
      coordenadas: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    capacidad: { type: Number, required: true },
    amenidades: [{ type: String }],
    disponibilidad: {
      horarioApertura: { type: String },
      horarioCierre: { type: String },
      diasDisponibles: [{ type: String, enum: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] }]
    },
    precios: {
      porHora: { type: Number },
      porDia: { type: Number },
      porMes: { type: Number }
    },
    imagenes: [{ type: String }],
    estado: { type: String, enum: ['disponible', 'ocupado', 'mantenimiento', 'reservado'], default: 'disponible' },
    propietarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    empresaInmobiliariaId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmpresaInmobiliaria' },
    activo: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);

module.exports = espacioSchema;
