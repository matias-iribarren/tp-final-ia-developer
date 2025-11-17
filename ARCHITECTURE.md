# Arquitectura de la Solución

Este documento describe la arquitectura actual de la aplicación y la visión a futuro, incluyendo la integración con herramientas externas para la automatización de la carga de horas.

## Arquitectura Actual

La aplicación sigue una arquitectura monolítica con un frontend y un backend fuertemente acoplados, construida sobre el framework Next.js.

```mermaid
graph TD
    subgraph "Usuario"
        U[Usuario]
    end

    subgraph "Clockify Clone App (Monolito con Next.js)"
        subgraph "Frontend (React + TypeScript)"
            F_UI[Componentes de UI <br/>(shadcn/ui, Tailwind)]
            F_Pages[Páginas <br/>(Dashboard, Proyectos, Clientes)]
        end

        subgraph "Backend (Server Actions & API Routes)"
            B_Auth[Autenticación]
            B_Logic[Lógica de Negocio]
            B_API[API de Time Entries <br/>(/api/time-entries)]
        end

        subgraph "Base de Datos (PostgreSQL - Neon)"
            DB[(Esquema de BD <br/> users, projects, time_entries)]
        end
    end

    subgraph "Servicios Externos"
        N8N[Automatización con n8n]
    end

    U --> F_Pages
    F_Pages -- "Interacción" --> B_Logic
    B_Logic -- "Consultas" --> DB
    B_Auth -- "Verificación" --> DB
    B_API -- "Acceso" --> B_Logic
    N8N -- "Llamada Webhook/API" --> B_API
```


### Componentes Principales

- **Frontend**:
  - **Tecnología**: Next.js (React) y TypeScript.
  - **UI**: Componentes de `shadcn/ui` y estilos con Tailwind CSS.
  - **Funcionalidades**:
    - Dashboard principal para la gestión de entradas de tiempo.
    - Secciones para administrar proyectos, clientes y etiquetas.
    - Formularios para la creación y edición de datos.
    - Visualización de reportes y analíticas.

- **Backend**:
  - **Tecnología**: Next.js Server Actions y API Routes.
  - **Lógica de Negocio**:
    - **Server Actions**: Para operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las entidades principales (proyectos, clientes, etc.).
    - **API Routes**: Endpoints específicos para integraciones externas, como la API de `time-entries` para n8n.
  - **Autenticación**: Sistema de sesiones propio con cookies HTTP-only.

- **Base de Datos**:
  - **Tecnología**: PostgreSQL (Neon).
  - **Esquema**:
    - `clockify.users`: Almacena la información de los usuarios.
    - `clockify.projects`: Gestiona los proyectos.
    - `clockify.time_entries`: Registra las entradas de tiempo.
    - `clockify.clients`: Administra la información de los clientes.
    - `clockify.tags`: Contiene las etiquetas para categorizar las entradas.

- **Automatización (n8n)**:
  - **Integración**: A través de un webhook que consume la API de `time-entries`.
  - **Flujo de Trabajo**: Un proceso en n8n se encarga de recopilar datos de diversas fuentes (potencialmente Jira, GitLab, etc.) y los envía al backend de la aplicación para su registro.

## Arquitectura Futura

La visión a futuro es evolucionar hacia una arquitectura más distribuida y orientada a eventos, que facilite la integración con múltiples herramientas y mejore la escalabilidad.

```mermaid
graph TD
    subgraph "Herramientas Externas"
        Jira[Jira]
        GitLab[GitLab]
        Google[Google Calendar]
    end

    subgraph "Usuario"
        U[Usuario]
    end

    subgraph "Arquitectura del Sistema"
        Frontend[Frontend Desacoplado]
        APIGateway[API Gateway]

        subgraph "Backend Principal"
            CoreService[Servicios Principales <br/>(Gestión de Tiempo, Proyectos)]
            DB[(Base de Datos)]
        end

        subgraph "Nuevos Microservicios"
            IntegrationService[Servicio de Integraciones]
            NotificationService[Servicio de Notificaciones]
            MessageQueue[(Cola de Mensajes <br/> RabbitMQ/Kafka)]
        end
    end

    U --> Frontend
    Frontend -- "Peticiones API" --> APIGateway

    APIGateway --> CoreService
    APIGateway --> IntegrationService
    APIGateway --> NotificationService

    CoreService --> DB
    IntegrationService --> CoreService
    IntegrationService --> MessageQueue
    IntegrationService --> NotificationService

    Jira -- "Webhook" --> APIGateway
    GitLab -- "Webhook" --> APIGateway
    Google -- "Webhook" --> APIGateway

    NotificationService -- "Envía Notificaciones" --> U
```


### Mejoras y Nuevos Componentes

- **API Gateway**:
  - **Propósito**: Centralizar y gestionar todas las solicitudes externas, mejorando la seguridad y el enrutamiento.
  - **Tecnología**: Un servicio como Kong, Tyk o una implementación personalizada.

- **Servicio de Integraciones**:
  - **Propósito**: Un microservicio dedicado a gestionar las conexiones con herramientas de terceros (Jira, GitLab, Google Drive).
  - **Funcionalidades**:
    - **Conectores**: Módulos específicos para cada herramienta, encargados de extraer y transformar los datos.
    - **Procesamiento de Eventos**: Utilización de colas de mensajes (como RabbitMQ o Kafka) para manejar los webhooks de manera asíncrona.

- **Servicio de Notificaciones**:
  - **Propósito**: Enviar notificaciones a los usuarios sobre eventos importantes (ej. "se ha registrado una nueva entrada de tiempo desde Jira").
  - **Canales**: Email, notificaciones push o integraciones con Slack/Teams.

- **Frontend Desacoplado**:
  - **Estrategia**: Separar completamente el frontend del backend, comunicándose exclusivamente a través de la API Gateway.
  - **Beneficios**: Desarrollo independiente, despliegues más flexibles y la posibilidad de crear múltiples clientes (web, móvil) sobre la misma API.

### Flujo de Integración Futuro

1. **Evento Externo**: Un usuario realiza una acción en una herramienta externa (ej. cierra una tarea en Jira).
2. **Webhook**: La herramienta externa envía un webhook al API Gateway.
3. **Procesamiento Asíncrono**: El API Gateway redirige el evento a una cola de mensajes.
4. **Servicio de Integraciones**: El servicio consume el mensaje, lo procesa y lo transforma en una entrada de tiempo estandarizada.
5. **Registro de Datos**: El servicio de integraciones se comunica con la API principal para registrar la entrada de tiempo en la base de datos.
6. **Notificación**: Se envía una notificación al usuario para informarle de la nueva entrada.
