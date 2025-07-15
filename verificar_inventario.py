import requests
import json

def verificar_inventario():
    print("🔍 Verificando datos de inventario...")
    
    try:
        # Verificar el endpoint de inventario detallado
        response = requests.get('http://localhost:5000/inventario/detalle')
        if response.status_code == 200:
            data = response.json()
            inventario = data.get('inventario', [])
            print(f"✅ Productos en inventario: {len(inventario)}")
            
            if inventario:
                print("\n📋 Productos disponibles:")
                for item in inventario[:5]:  # Mostrar solo los primeros 5
                    print(f"   - {item['nombre']} (Stock: {item['stock']}, Sucursal: {item['sucursal_nombre']})")
                if len(inventario) > 5:
                    print(f"   ... y {len(inventario) - 5} productos más")
            else:
                print("❌ No hay productos en inventario")
        else:
            print(f"❌ Error al obtener inventario: {response.status_code}")
            print(f"Respuesta: {response.text}")
            
        # Verificar también el endpoint de productos original
        print("\n🔍 Verificando endpoint de productos original...")
        response = requests.get('http://localhost:5000/productos')
        if response.status_code == 200:
            data = response.json()
            productos = data.get('productos', [])
            print(f"✅ Productos totales: {len(productos)}")
            
            if productos:
                print("\n📋 Productos totales:")
                for item in productos[:5]:  # Mostrar solo los primeros 5
                    stock = item.get('stock', 0)
                    print(f"   - {item['nombre']} (Stock: {stock})")
                if len(productos) > 5:
                    print(f"   ... y {len(productos) - 5} productos más")
        else:
            print(f"❌ Error al obtener productos: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión. Asegúrate de que la API esté ejecutándose en http://localhost:5000")
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")

if __name__ == "__main__":
    verificar_inventario() 