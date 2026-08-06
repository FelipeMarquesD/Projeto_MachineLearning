# Projeto Machine Learning — Dog & Cat 🐶🐱

Detector de Gato & Cachorro usando **Teachable Machine + TensorFlow.js**, com interface bonita, animações, tema claro/escuro e opção de salvar a foto da detecção.

## Estrutura
```
Projeto-MachineLearning-Dog-&-Cat/
├── index.html      → página principal
├── style.css       → estilos e animações
├── script.js       → lógica do modelo (Teachable Machine)
└── model/          → seu modelo treinado
    ├── model.json
    ├── metadata.json
    └── weights.bin
```

## Como rodar
A câmera do navegador exige um servidor local (não funciona abrindo o `index.html` direto pelo arquivo).

Escolha uma opção dentro da pasta do projeto:

**Python**
```
python -m http.server 8000
```

**Node**
```
npx serve
```

Depois abra no navegador: `http://localhost:8000`

Clique em **Iniciar detecção**, permita o acesso à câmera e aponte para o seu pet.

## Funcionalidades
- 🎥 Detecção em tempo real (Gato / Cachorro)
- 📊 Barras de confiança animadas por classe
- 🌗 Botão para alternar tema escuro / claro pastel
- 📸 Botão "Salvar foto" que baixa um print com o resultado sobreposto
