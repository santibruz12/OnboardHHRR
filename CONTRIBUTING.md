# Contribuir a OnBoard HRRR

¡Gracias por tu interés en contribuir al proyecto OnBoard HRRR! Aquí tienes las pautas para contribuir de manera efectiva.

## Proceso de Contribución

1. **Fork del repositorio**
2. **Crear rama de feature** desde `main`
3. **Desarrollar tu contribución**
4. **Ejecutar tests** (si aplican)
5. **Crear Pull Request**

## Tipos de Contribuciones

### 🐛 Reportar Bugs
- Usar el template de issue para bugs
- Incluir pasos para reproducir
- Especificar versión del sistema operativo y navegador
- Incluir capturas de pantalla si es relevante

### 💡 Sugerir Features
- Usar el template de issue para features
- Explicar el problema que resuelve
- Describir la solución propuesta
- Considerar alternativas

### 🔧 Contribuciones de Código
- Seguir las convenciones de código existentes
- Escribir código TypeScript tipado
- Mantener consistencia con el estilo actual
- Actualizar documentación si es necesario

## Configuración de Desarrollo

1. **Clonar tu fork:**
```bash
git clone https://github.com/tu-usuario/onboard-hrrr.git
cd onboard-hrrr
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar base de datos:**
```bash
cp .env.example .env
# Editar .env con tus datos
npm run db:push
```

4. **Iniciar desarrollo:**
```bash
npm run dev
```

## Convenciones de Código

### TypeScript
- Usar tipos explícitos cuando sea necesario
- Aprovechar la inferencia de tipos de TypeScript
- Evitar `any`, usar tipos específicos

### React
- Componentes funcionales con hooks
- Usar nombres descriptivos para componentes
- Extraer lógica compleja a hooks personalizados

### Styling
- Usar Tailwind CSS para estilos
- Componentes de shadcn/ui cuando sea posible
- Mantener consistencia con el design system

### Base de Datos
- Usar Drizzle ORM para queries
- Definir schemas en `shared/schema.ts`
- Aplicar cambios con `npm run db:push`

## Estructura de Commits

Usar formato de commits convencionales:

```
tipo(scope): descripción

[cuerpo opcional]

[footer opcional]
```

### Tipos permitidos:
- `feat`: nueva funcionalidad
- `fix`: corrección de bug
- `docs`: cambios en documentación
- `style`: cambios de formato/estilo
- `refactor`: refactoring de código
- `test`: agregar o modificar tests
- `chore`: tareas de mantenimiento

### Ejemplos:
```bash
feat(auth): agregar validación de cédula venezolana
fix(sidebar): corregir colapso en móviles
docs(readme): actualizar instrucciones de instalación
```

## Estructura de Pull Requests

### Título
Usar mismo formato que commits: `tipo(scope): descripción`

### Descripción
Incluir:
- **¿Qué cambia?** - Resumen de los cambios
- **¿Por qué?** - Justificación del cambio
- **¿Cómo testear?** - Pasos para probar los cambios
- **Screenshots** - Si hay cambios visuales

### Checklist
- [ ] El código sigue las convenciones del proyecto
- [ ] Se han agregado tests (si aplica)
- [ ] La documentación ha sido actualizada
- [ ] Los cambios no rompen funcionalidad existente
- [ ] El PR tiene una descripción clara

## Funcionalidades Prioritarias

Si quieres contribuir pero no sabes por dónde empezar, estas son las funcionalidades más necesarias:

### Alta Prioridad
- [ ] CRUD completo de empleados
- [ ] Gestión de contratos
- [ ] Sistema de períodos de prueba
- [ ] Reportes básicos

### Media Prioridad
- [ ] Sistema de notificaciones
- [ ] Exportación de datos (Excel/PDF)
- [ ] Gestión de vacaciones
- [ ] Módulo de evaluaciones

### Baja Prioridad
- [ ] Módulo de reclutamiento
- [ ] Sistema de capacitaciones
- [ ] Dashboard avanzado
- [ ] App móvil

## Testing

Aunque aún no hay suite de tests implementada, las contribuciones futuras deberían incluir:

- Tests unitarios para funciones críticas
- Tests de integración para APIs
- Tests de componentes React
- Tests end-to-end para flujos principales

## Documentación

Al contribuir, considera actualizar:

- `README.md` - Si cambias funcionalidades principales
- `DOCUMENTACION_SISTEMA.txt` - Para cambios técnicos
- Comentarios en código - Para lógica compleja
- JSDoc - Para funciones públicas

## Revisión de Código

### Lo que buscamos:
- Código limpio y legible
- Funcionalidad bien implementada
- Consistencia con el resto del proyecto
- Buenas prácticas de seguridad
- Rendimiento adecuado

### Lo que evitamos:
- Código duplicado
- Funciones muy largas o complejas
- Falta de validación de datos
- Vulnerabilidades de seguridad
- Cambios que rompan compatibilidad

## Comunicación

- **Issues:** Para reportar bugs y sugerir features
- **Pull Requests:** Para contribuciones de código
- **Discusiones:** Para preguntas generales y ideas

## Reconocimientos

Todos los contribuidores serán reconocidos en:
- Lista de contribuidores en README
- Release notes cuando corresponda
- Comentarios de agradecimiento en PRs

## Código de Conducta

### Nuestro Compromiso
Crear un ambiente acogedor y libre de acoso para todos.

### Comportamiento Esperado
- Ser respetuoso con otros colaboradores
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

### Comportamiento Inaceptable
- Lenguaje o imágenes sexualizadas
- Trolling, comentarios despectivos
- Acoso público o privado
- Publicar información privada sin permiso

## Preguntas

¿Tienes preguntas sobre cómo contribuir? Crear un issue con la etiqueta "question" o contactar a los mantenedores.

¡Gracias por contribuir al proyecto OnBoard HRRR! 🚀