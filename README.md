📌 Justificación de la Elección de los Hiperparámetros
En este proyecto, se implementó un modelo de regresión lineal con TensorFlow/Keras para predecir la evolución de un paciente. Los siguientes hiperparámetros fueron seleccionados después de múltiples pruebas y ajustes manuales:

🔹 Optimizer: Adam
Se eligió Adam porque es un optimizador adaptativo que ajusta la tasa de aprendizaje dinámicamente, lo que acelera la convergencia y evita quedar atrapado en mínimos locales.
Se probó con SGD, pero el modelo tardaba más en converger y tenía mayor error.
🔹 Learning Rate: 0.0005
Un learning rate bajo permite una convergencia estable sin grandes oscilaciones en la pérdida.
Se probó con valores más altos (0.01) y el modelo no convergía bien.
🔹 Epochs: 300
Se seleccionó 300 épocas porque los gráficos de loss y MAE muestran que el modelo sigue mejorando hasta ese punto.
Con menos épocas (100 o 200), el modelo tenía mayor MAE.
🔹 Batch Size: 8
Se usa un batch size de 8 porque es un valor pequeño que permite una mejor actualización de pesos en cada iteración.
Se probó con 32, pero el entrenamiento no era tan preciso.
🔹 Función de Pérdida: Mean Squared Error (MSE)
MSE penaliza más los errores grandes, lo que ayuda a optimizar la predicción del modelo.
🔹 Inicialización de Pesos: Default (Xavier/Glorot)
Se usó la inicialización por defecto de TensorFlow (Glorot Uniform), ya que mantiene los valores iniciales de los pesos en un rango óptimo.
📊 Resultados Finales
Pérdida final en validación (loss): 0.3017
Error Absoluto Medio (MAE): 0.4492
El modelo logra un bajo error en validación, lo que indica que generaliza bien.
