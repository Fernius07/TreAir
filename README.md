# 🛫 TreeAir - Premium Flight Management System

<div align="center">

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Una solución integral para la gestión de vuelos y portal de personal, diseñada para ofrecer una experiencia premium y moderna.**

[Únete a nuestro Discord](https://discord.gg/QjJDABk9Nh) • [Grupo de Roblox](https://www.roblox.com/es/communities/33295484)

</div>

---

## 🌟 Visión General

**TreeAir** no es solo una página web; es un sistema robusto de gestión aeroportuaria escalable. Combina una interfaz pública elegante para que los pasajeros consulten estados de vuelos en tiempo real, con un potente panel administrativo para la gestión de operaciones, personal y procesos de contratación.

Inspirado en las estéticas modernas de "Dark Mode" y "Glassmorphism", TreeAir ofrece una navegación fluida y visualmente impactante.

---

## 🚀 Características Principales

### 🌐 Interfaz Pública (Pasajeros)
*   **🕒 Panel de Vuelos Real-Time:** Seguimiento dinámico de estados (Boarding, Flying, Landed, Delayed).
*   **📊 Información Detallada:** Visualización de códigos IATA, números de vuelo (TR-XXX), aeronaves y puertas de embarque.
*   **⚠️ Sistema de Alertas:** Notificaciones visuales de retrasos con cálculo automático de demora y motivos de cancelación.
*   **🗺️ Visualización de Rutas:** Diseño intuitivo que muestra el origen y destino con iconos animados.

### 🛠️ Portal de Gestión (Staff)
*   **✈️ Gestión de Vuelos:** Sistema completo para añadir, editar y eliminar vuelos con validación inteligente (no permite vuelos en el pasado).
*   **📝 Constructor de Cuestionarios:** Herramienta dinámica para crear formularios de postulación para nuevos empleados.
*   **💼 Gestión de Ofertas de Empleo:** Panel para publicar y administrar vacantes en la aerolínea.
*   **🔒 Seguridad Robusta:** Protección de rutas y almacenamiento seguro de datos mediante Supabase.

---

## 🏗️ Stack Tecnológico

TreeAir utiliza tecnologías de vanguardia para garantizar rendimiento y escalabilidad:

| Tecnología | Propósito |
| :--- | :--- |
| **React 19** | Biblioteca principal para la interfaz de usuario. |
| **Vite** | Herramienta de compilación ultrarrápida. |
| **Supabase** | Backend como servicio (Base de datos PostgreSQL y Auth). |
| **Vanilla CSS** | Diseño personalizado de alto rendimiento sin dependencias pesadas. |
| **React Router** | Navegación interna fluida y sin recargas de página. |

---

## 🛠️ Instalación para Desarrolladores

Si deseas clonar el proyecto y trabajar en él localmente:

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/TreeAir.git
    cd TreeAir
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz con tus credenciales de Supabase:
    ```env
    VITE_SUPABASE_URL=tu_url_aqui
    VITE_SUPABASE_ANON_KEY=tu_llave_aqui
    ```

4.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```

---

## 📖 Guía de Uso

### Para el Usuario / Pasajero
Simplemente navega a la sección de **Vuelos** para ver la tabla horaria. Si un vuelo está retrasado, verás la hora original tachada y la nueva hora estimada en color naranja, junto con el tiempo total de retraso.

### Para el Personal Administrativo (Staff)
1.  Inicia sesión a través del portal de empleados.
2.  En **Manage Flights**, puedes usar el botón "Add New Flight".
3.  Ingresa el código IATA (Ej: BIO, BCN) y selecciona la aeronave (ATR 72-600).
4.  **Nota:** El sistema calculará automáticamente la duración del vuelo y validará que la fecha no sea anterior a hoy.

---

## 📂 Estructura del Proyecto

```text
TreeAir/
├── src/
│   ├── components/     # Componentes reutilizables (Modales, Navbar)
│   ├── lib/            # Configuración de servicios (Supabase)
│   ├── pages/          # Vistas principales (Home, Schedule, Management)
│   ├── index.css       # Estilos globales y tokens de diseño
│   └── App.jsx         # Enrutamiento y estructura base
├── public/             # Activos estáticos
└── README.md           # Documentación
```

---

<div align="center">

**Desarrollado con ❤️ para la comunidad de Aviación en Roblox.**

</div>
