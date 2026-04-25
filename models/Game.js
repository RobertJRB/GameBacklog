const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      minlength: [2, "El título debe tener al menos 2 caracteres"],
      maxlength: [100, "El título no puede superar 100 caracteres"],
    },
    genero: {
      type: String,
      required: [true, "El género es obligatorio"],
      enum: {
        values: [
          "Acción",
          "Aventura",
          "RPG",
          "Estrategia",
          "Deportes",
          "Simulación",
          "Terror",
          "Plataformas",
          "Puzzle",
          "Lucha",
          "Carreras",
          "Otro",
        ],
        message: "Género no válido",
      },
    },
    plataforma: {
      type: String,
      required: [true, "La plataforma es obligatoria"],
      enum: {
        values: [
          "PC",
          "PlayStation 5",
          "PlayStation 4",
          "Xbox Series X/S",
          "Xbox One",
          "Nintendo Switch",
          "Mobile",
          "Otro",
        ],
        message: "Plataforma no válida",
      },
    },
    estado: {
      type: String,
      required: [true, "El estado es obligatorio"],
      enum: {
        values: ["Por jugar", "Jugando", "Terminado", "Abandonado"],
        message: "Estado no válido",
      },
      default: "Por jugar",
    },
    calificacion: {
      type: Number,
      min: [0, "La calificación mínima es 0"],
      max: [10, "La calificación máxima es 10"],
      default: null,
    },
    notas: {
      type: String,
      trim: true,
      maxlength: [500, "Las notas no pueden superar 500 caracteres"],
      default: "",
    },
    portada: {
      type: String,
      trim: true,
      default: "",
    },
    anioLanzamiento: {
      type: Number,
      min: [1970, "Año inválido"],
      max: [new Date().getFullYear() + 2, "Año inválido"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Game", gameSchema);
