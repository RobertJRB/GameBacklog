const express = require("express");
const router = express.Router();
const Game = require("../models/Game");

router.get("/", async (req, res) => {
  try {
    const { estado, genero, plataforma, buscar } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (genero) filtro.genero = genero;
    if (plataforma) filtro.plataforma = plataforma;
    if (buscar) {
      filtro.titulo = { $regex: buscar, $options: "i" };
    }

    const games = await Game.find(filtro).sort({ createdAt: -1 });

    const total = await Game.countDocuments();
    const terminados = await Game.countDocuments({ estado: "Terminado" });
    const jugando = await Game.countDocuments({ estado: "Jugando" });
    const porJugar = await Game.countDocuments({ estado: "Por jugar" });

    const calificados = await Game.find({
      calificacion: { $ne: null },
    }).select("calificacion");

    const promedio =
      calificados.length > 0
        ? (
            calificados.reduce((sum, g) => sum + g.calificacion, 0) /
            calificados.length
          ).toFixed(1)
        : null;

    res.json({
      success: true,
      count: games.length,
      stats: { total, terminados, jugando, porJugar, promedio },
      data: games,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Juego no encontrado" });
    }
    res.json({ success: true, data: game });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const game = new Game(req.body);
    const savedGame = await game.save();
    res.status(201).json({
      success: true,
      message: "Juego agregado exitosamente",
      data: savedGame,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Juego no encontrado" });
    }
    res.json({
      success: true,
      message: "Juego actualizado correctamente",
      data: game,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Juego no encontrado" });
    }
    res.json({ success: true, message: "Juego eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
