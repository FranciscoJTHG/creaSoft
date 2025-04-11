<p align="center">
  <img src="Logo Cine Mind.png" alt="CineMind logo" width="200"/>
</p>

## Links del proyecto
- **Figma:** https://www.figma.com/design/ms3mwBZM9GEWcQjqJaplDl/AI-Movie-predictor?node-id=0-1&t=EDojiqs1jjQdpxLz-1
- **Back-End:** https://creasoft-production.up.railway.app/api/docs
- **Front-End:** https://crea-soft-movies.vercel.app/

  
# 🎬 Cine Mind

Una aplicación web que utiliza inteligencia artificial para **predecir el éxito potencial de una película** antes de su estreno, basada en variables como presupuesto, género, fecha de estreno y duración. Ideal para productores, analistas y curiosos del cine que buscan tomar decisiones informadas.

---

## 🚀 Funcionalidades

- Ingreso de variables clave de una película (presupuesto, género, fecha de estreno y duración)
- Predicción de éxito con porcentaje estimado
- Interpretación visual de factores influyentes en el resultado
- Simulación de escenarios alternativos cambiando variables

## 🧠 Inteligencia Artificial

Este proyecto utiliza:
- Modelo de clasificación binaria en el cual se implementa un MLP o Red Neuronal Feed-Forward para ser entrenado
- **Dataset IMDb** base generado a partir de ejemplos reales y sintéticos el cual proporciona los datos para el entrenamiento del modelo.
- Algoritmo de regresión logística / árbol de decisión / random forest (según evolución)

---

## Caracteristicas de Entrada

El modelo utiliza estas características para predecir: 
- budget_normalized: Presupuesto normalizado
- runtime_normalized: Duración normalizada
- release_month: Mes de lanzamiento (1-12 dividido por 12)
- release_day_of_week: Día de la semana (0-6 dividido por 6)
- Indicadores de género: Representación one-hot para cada género

---

## 🛠️ Tecnologías

| Categoría       | Herramientas                             |
|----------------|-------------------------------------------|
| Frontend       | NextJS, TypeScript                        |
| Backend        | Javascript, framework Nestjs, db postgres |
| IA / ML        | Libreria tensorflow.js                    |
| Hosting        | Docker (Back-End),                          |
| Otros          | Trello (gestión de tareas), Figma (UI/UX) |


## 👥 Equipo

- 👨‍💻 **Desarrolladores:**
  - Vladimir Villacres (Front-End)
      - **LinkedIn:** https://www.linkedin.com/in/vladimir-villacres/
  - Jorge Trujillo (Front-End)
      - **LinkedIn:** https://www.linkedin.com/in/jorge-trujillo-ch/
  - Francisco Thielen (Back-End)
      - **LinkedIn:** https://www.linkedin.com/in/francisco-thielen-ingeniero-software/

- 🎨 **Diseñador/a UX/UI:**
  - Alex Ruiz
    - **LinkedIn:** https://www.linkedin.com/in/alexruix

- 🧪 **QA Tester:** Mikhail Garcilano
- 🧭 **Project Manager:** Mikhail Garcilano
  - **LinkedIn:** https://www.linkedin.com/in/mikhailgarcilano/

## 📝 Historias de Usuario

Ver el tablero de Trello con las historias y tareas asignadas:

🔗 https://trello.com/invite/b/67f13477dfe0595b0e990c38/ATTId10014a93e9fc734b9d239af09309a46B09A184B/creasoft

## 💡 Futuras mejoras
- Registro de usuario e historial personal de predicciones

- Uso de modelos más complejos

- API pública para consumir desde otras apps

- Mejor visualización de datos y comparaciones

## 🧠 Créditos
Proyecto desarrollado en 5 días por el equipo CreaSoft, con foco en innovación y predicción aplicada a la industria del cine 🎥
