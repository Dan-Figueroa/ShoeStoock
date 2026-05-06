import os
import pandas as pd
import matplotlib.pyplot as plt

from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("No se encontró MONGO_URI en el archivo .env")


client = MongoClient(MONGO_URI)
db = client["ZapateriaDB"]

coleccion_zapatos = db["Zapatos"]
coleccion_metricas = db["MetricasSistema"]


def cargar_datos():
    zapatos = list(coleccion_zapatos.find())
    metricas = list(coleccion_metricas.find())

    df_zapatos = pd.DataFrame(zapatos)
    df_metricas = pd.DataFrame(metricas)

    return df_zapatos, df_metricas


def limpiar_datos(df_zapatos, df_metricas):
    if not df_zapatos.empty:
        df_zapatos = df_zapatos.drop(columns=["_id", "__v"], errors="ignore")
        df_zapatos["precio"] = pd.to_numeric(df_zapatos["precio"], errors="coerce")
        df_zapatos["stock"] = pd.to_numeric(df_zapatos["stock"], errors="coerce")
        df_zapatos["color"] = df_zapatos["color"].fillna("No especificado")
        df_zapatos["estado"] = df_zapatos["estado"].fillna("Disponible")

    if not df_metricas.empty:
        df_metricas = df_metricas.drop(columns=["_id", "__v"], errors="ignore")
        df_metricas["peticiones"] = pd.to_numeric(df_metricas["peticiones"], errors="coerce")
        df_metricas["tiempo_respuesta"] = pd.to_numeric(df_metricas["tiempo_respuesta"], errors="coerce")
        df_metricas["nodos"] = pd.to_numeric(df_metricas["nodos"], errors="coerce")
        df_metricas["registros_insertados"] = pd.to_numeric(df_metricas["registros_insertados"], errors="coerce")

    return df_zapatos, df_metricas


def exportar_csv(df_zapatos, df_metricas):
    os.makedirs("datos", exist_ok=True)

    df_zapatos.to_csv("datos/zapatos_limpios.csv", index=False)
    df_metricas.to_csv("datos/metricas_limpias.csv", index=False)

    print("CSV generados correctamente en la carpeta datos.")


def grafica_productos_por_tipo(df_zapatos):
    conteo = df_zapatos["tipo"].value_counts()

    plt.figure()
    conteo.plot(kind="bar")
    plt.title("Productos por tipo de calzado")
    plt.xlabel("Tipo de calzado")
    plt.ylabel("Cantidad de productos")
    plt.tight_layout()
    plt.savefig("graficas/productos_por_tipo.png")
    plt.close()


def grafica_stock_por_tipo(df_zapatos):
    stock = df_zapatos.groupby("tipo")["stock"].sum().sort_values(ascending=False)

    plt.figure()
    stock.plot(kind="bar")
    plt.title("Stock total por tipo de calzado")
    plt.xlabel("Tipo de calzado")
    plt.ylabel("Stock total")
    plt.tight_layout()
    plt.savefig("graficas/stock_por_tipo.png")
    plt.close()


def grafica_precio_promedio_marca(df_zapatos):
    precios = df_zapatos.groupby("marca")["precio"].mean().sort_values(ascending=False)

    plt.figure()
    precios.plot(kind="bar")
    plt.title("Precio promedio por marca")
    plt.xlabel("Marca")
    plt.ylabel("Precio promedio")
    plt.tight_layout()
    plt.savefig("graficas/precio_promedio_marca.png")
    plt.close()


def grafica_metricas_estado(df_metricas):
    estados = df_metricas["estado"].value_counts()

    plt.figure()
    estados.plot(kind="bar")
    plt.title("Comportamiento del sistema por estado")
    plt.xlabel("Estado del sistema")
    plt.ylabel("Cantidad de registros")
    plt.tight_layout()
    plt.savefig("graficas/metricas_por_estado.png")
    plt.close()


def generar_graficas(df_zapatos, df_metricas):
    os.makedirs("graficas", exist_ok=True)

    if not df_zapatos.empty:
        grafica_productos_por_tipo(df_zapatos)
        grafica_stock_por_tipo(df_zapatos)
        grafica_precio_promedio_marca(df_zapatos)

    if not df_metricas.empty:
        grafica_metricas_estado(df_metricas)

    print("Gráficas generadas correctamente en la carpeta graficas.")


def generar_reporte(df_zapatos, df_metricas):
    total_productos = len(df_zapatos)
    stock_total = df_zapatos["stock"].sum() if not df_zapatos.empty else 0
    precio_promedio = df_zapatos["precio"].mean() if not df_zapatos.empty else 0

    productos_bajo_stock = (
        df_zapatos[df_zapatos["stock"] <= 5]
        if not df_zapatos.empty
        else pd.DataFrame()
    )

    total_metricas = len(df_metricas)
    estado_mas_frecuente = "Sin datos"

    if not df_metricas.empty:
        estado_mas_frecuente = df_metricas["estado"].value_counts().idxmax()

    reporte = f"""
REPORTE DE ANÁLISIS DEL SISTEMA SHOESTOCK

1. Resumen del inventario
Total de productos registrados: {total_productos}
Stock total disponible: {stock_total}
Precio promedio de productos: ${precio_promedio:.2f}

2. Productos con inventario bajo
Total de productos con stock menor o igual a 5: {len(productos_bajo_stock)}

3. Métricas del sistema
Total de métricas registradas: {total_metricas}
Estado más frecuente del sistema: {estado_mas_frecuente}

4. Interpretación
El análisis permite identificar el comportamiento general del inventario de la zapatería.
También permite reconocer productos con inventario bajo, los cuales requieren atención para evitar desabasto.
Las métricas del sistema ayudan a observar si el comportamiento del sistema se encuentra normal, lento o saturado.
Estos datos servirán como base para el análisis posterior y para el modelo de árbol de decisión.
"""

    with open("datos/reporte_analisis.txt", "w", encoding="utf-8") as archivo:
        archivo.write(reporte)

    print(reporte)
    print("Reporte generado en datos/reporte_analisis.txt")


def main():
    print("Conectando con MongoDB Atlas...")

    df_zapatos, df_metricas = cargar_datos()

    print("Limpiando datos...")
    df_zapatos, df_metricas = limpiar_datos(df_zapatos, df_metricas)

    print("Exportando CSV...")
    exportar_csv(df_zapatos, df_metricas)

    print("Generando gráficas...")
    generar_graficas(df_zapatos, df_metricas)

    print("Generando reporte...")
    generar_reporte(df_zapatos, df_metricas)

    print("Proceso finalizado correctamente.")


if __name__ == "__main__":
    main()