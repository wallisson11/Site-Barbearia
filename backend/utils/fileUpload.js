const path = require('path');
const express = require('express');
const multer = require('multer');

// Configuração de armazenamento para imagens de referência
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/referencias/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Apenas imagens são permitidas!'));
};

// Configuração do upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
