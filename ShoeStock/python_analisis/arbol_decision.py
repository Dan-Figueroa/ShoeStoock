import os
import pandas as pd
import matplotlib.pyplot as plt

from pymongo import MongoClient
from dotenv import load_dotenv
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("No se encontró MONGO_URI en el archivo .env")


client = MongoClient(MONGO_URI)
db = client["ZapateriaDB"]

coleccion_metricas = db["MetricasSistema"]


def cargar_metricas():
    metricas = list(coleccion_metricas.find())
    df_metricas = pd.DataFrame(metricas)

    if df_metricas.empty:
        raise ValueError("No hay métricas registradas para entrenar el modelo.")

    return df_metricas


def limpiar_metricas(df_metricas):
    df_metricas = df_metricas.drop(columns=["_id", "__v"], errors="ignore")

    columnas_numericas = [
        "peticiones",
        "tiempo_respuesta",
        "nodos",
        "registros_insertados",
    ]

    for columna in columnas_numericas:
        df_metricas[columna] = pd.to_numeric(df_metricas[columna], errors="coerce")

    df_metricas = df_metricas.dropna(
        subset=[
            "peticiones",
            "tiempo_respuesta",
            "nodos",
            "registros_insertados",
            "estado",
        ]
    )

    return df_metricas


def entrenar_arbol(df_metricas):
    x = df_metricas[
        [
            "peticiones",
            "tiempo_respuesta",
            "nodos",
            "registros_insertados",
        ]
    ]

    y = df_metricas["estado"]

    if len(df_metricas) < 10:
        print("Advertencia: hay pocos datos, el modelo funcionará como demostración.")

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.50,
        random_state=42,
        stratify=y if y.value_counts().min() >= 2 else None,
    )

    modelo = DecisionTreeClassifier(
        criterion="gini",
        max_depth=3,
        random_state=42,
    )

    modelo.fit(x_train, y_train)

    predicciones = modelo.predict(x_test)
    exactitud = accuracy_score(y_test, predicciones)

    print("\nRESULTADOS DEL MODELO DE ÁRBOL DE DECISIÓN")
    print(f"Exactitud del modelo: {exactitud:.2f}")
    print("\nReporte de clasificación:")
    print(classification_report(y_test, predicciones, zero_division=0))

    return modelo, x.columns


def guardar_grafica_arbol(modelo, columnas, clases):
    os.makedirs("graficas", exist_ok=True)

    plt.figure(figsize=(14, 8))
    plot_tree(
        modelo,
        feature_names=columnas,
        class_names=clases,
        filled=True,
        rounded=True,
    )
    plt.title("Árbol de decisión para clasificar el comportamiento del sistema")
    plt.tight_layout()
    plt.savefig("graficas/arbol_decision_metricas.png")
    plt.close()

    print("Gráfica del árbol generada en graficas/arbol_decision_metricas.png")


def realizar_predicciones(modelo):
    nuevos_datos = pd.DataFrame(
        [
            {
                "peticiones": 100,
                "tiempo_respuesta": 220,
                "nodos": 3,
                "registros_insertados": 9,
            },
            {
                "peticiones": 250,
                "tiempo_respuesta": 600,
                "nodos": 7,
                "registros_insertados": 18,
            },
            {
                "peticiones": 500,
                "tiempo_respuesta": 980,
                "nodos": 14,
                "registros_insertados": 35,
            },
        ]
    )

    predicciones = modelo.predict(nuevos_datos)
    nuevos_datos["prediccion_estado"] = predicciones

    os.makedirs("datos", exist_ok=True)
    nuevos_datos.to_csv("datos/predicciones_arbol.csv", index=False)

    print("\nPREDICCIONES CON NUEVOS DATOS")
    print(nuevos_datos)
    print("Predicciones guardadas en datos/predicciones_arbol.csv")


def generar_reporte_modelo(df_metricas):
    total = len(df_metricas)
    conteo_estados = df_metricas["estado"].value_counts()

    reporte = f"""
REPORTE DEL MODELO DE ÁRBOL DE DECISIÓN

1. Datos utilizados
Total de registros de métricas utilizados: {total}

Distribución de estados:
{conteo_estados.to_string()}

2. Variable objetivo
La variable objetivo del modelo fue el campo 'estado', el cual clasifica el comportamiento del sistema en:
- normal
- lento
- saturado

3. Variables predictoras
Para entrenar el modelo se utilizaron las siguientes variables:
- peticiones
- tiempo_respuesta
- nodos
- registros_insertados

4. Interpretación
El árbol de decisión permite clasificar el comportamiento del sistema de acuerdo con las métricas registradas.
El tiempo de respuesta es una variable importante porque ayuda a identificar cuándo el sistema trabaja de forma normal, lenta o saturada.
Este modelo funciona como una herramienta de apoyo para anticipar posibles problemas de rendimiento y tomar decisiones preventivas.
"""

    with open("datos/reporte_arbol_decision.txt", "w", encoding="utf-8") as archivo:
        archivo.write(reporte)

    print("Reporte generado en datos/reporte_arbol_decision.txt")


def main():
    print("Cargando métricas desde MongoDB Atlas...")
    df_metricas = cargar_metricas()

    print("Limpiando métricas...")
    df_metricas = limpiar_metricas(df_metricas)

    print("Entrenando modelo de árbol de decisión...")
    modelo, columnas = entrenar_arbol(df_metricas)

    clases = sorted(df_metricas["estado"].unique())

    print("Generando gráfica del árbol...")
    guardar_grafica_arbol(modelo, columnas, clases)

    print("Realizando predicciones...")
    realizar_predicciones(modelo)

    print("Generando reporte del modelo...")
    generar_reporte_modelo(df_metricas)

    print("Proceso del árbol de decisión finalizado correctamente.")


if __name__ == "__main__":
    main()