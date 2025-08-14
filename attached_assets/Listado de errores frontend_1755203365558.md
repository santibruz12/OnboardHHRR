# Listado de errores frontend

Errores en frontend

1. GLOBAL
    1. agregar fecha actual en todas las paginas (formato: dd de mm de aaaa)
    2. revisar funcionalidad del boton de abrir y cerrar sidebar
2. Dashboard principal
    1. Actualizar en tiempo real las tarjetas la cantidad y variaciones que se muestran del último mes
    2. Acciones rápidas no ejecutan nada (solo abre ventana funcional el botón de nuevo empleado)
    3. Botón ver todo en actividad reciente no hace nada
3. Modulo empleados
    1. Actualización de tarjetas automática
        1. Total si se actualiza, activos si actualiza (cambiar orden), en prueba no se actualiza, distinguir en periodos de prueba los nuevos ingresos y los ascensos/movimientos 
        2. agregar tarjeta de contratos vencidos
    2. Botón filtros no hace nada.
    3. Ventana de creación:
        1. Al elegir una fecha de ingreso, que esta fecha se ponga duplique en el campo de fecha de inicio de contrato automáticamente (editable)
        2. Si se elige tipo de contrato diferente a indeterminado/indefinido, que la fecha de fin se calcule automáticamente para 3 meses (90 dias) desde la fecha de inicio (editable)
    4. Edición de empleados
        1. Si se cambia la fecha de ingreso o de inicio de contrato, esta se debe actualizar en el modulo de contratos también.
        2. Agregar botón para cambiar estatus del empleado, este debe además tener diferentes estatus (activo, inactivo, vacaciones, etc)
4. Modulo contratos
    1. Actualización de tarjetas automática (total si, activos si, por vencer no se actualiza según fecha, agregar tarjeta de vencidos, agregar tarjeta de indefinidos y de tiempo/obra determinada)
    2. Buscador y filtros funcionales (sin errores)
    3. ¿Por qué las fechas de inicio y fin de contrato aparecen listadas con el día anterior a lo ingresado en el modulo empleados? Por ejemplo en el modulo empleados un empleado tiene fecha de ingreso y de inicio de contrato 15/8/2025 y en el modulo de contratos aparece con fecha 14/8/2025, igual pasa con los que tienen fecha de finalización
    4. Cuando falten 10 días para finalizar el contrato de un empleado, quiero que aparezca en la tarjeta de “por vencer” también debe mantener su estatus activo. En el listado de contratos el indicador esta bien (signo de exclamación naranja al lado de la fecha de fin)
    5. Cuando haya pasado la fecha de finalización el empleado debe sumar en la tarjeta de vencidos, sin embargo mantiene su estatus activo siempre que no se haya registrado el egreso. (usar signo de exclamación color rojo al de la fecha de fin)
5. modulo periodos de prueba
    1. actualizacion de tarjetas en tiempo real, distinguir el tipo de periodo de pruebas, “nuevo ingreso” “ascenso y movimiento”. cambiar tarjeta de “por vencer” a “por finalizar”.
    2. en el listado de periodos de prueba, dependiendo de la fecha se debe cambiar el estado entre activo o completado/aprobado/no aprobado. si un periodo de prueba es extendido se agrega un tag en el listado pero no sustituye al estado activo.
    3. en el listado de periodos de prueba se ordenan por defecto de forma ascendente segun los dias restantes
    4. segun se acerque la fecha del fin del periodo de prueba, cuando falten 10 dias para completarlo se agrega un signo de exclamacion naranja para avisar al supervisor que entregue el feedback (responda los campos “notas de evaluacion” y “recomendacion de supervisor”)
    5. cuando el supervisor realice la evaluacion, este signo de exclamacion naranja cambiara a un signo de exclamacion verde, tambien se pone verde el numero de dias restantes. 
    6. cuando el estatus cambie a aprobado o no aprobado, desaparece el signo de exclamacion.
    7. una vez que el estado del periodo de prueba sea completado/aprobado/no aprobado estos pasan al final de la lista. 
    8. el criterio de ordenamiento es dias restantes+activo/extendido>vencido+reciente>completado+reciente 
6. modulo egresos
    1. agregar egresos no esta haciendo nada
    2. se abre una ventana para cargar la informacion pero al darle a crear egreso no hace nada, no se muestra en la lista.
7. modulo candidatos
    1. error al cambiar de estatus un candidato
    2. error al editar informacion de algun candidato
    3. error al intentar eliminar un candidato
    4. error al crear un candidato
    5. filtro de estado funcional
    6. agregar en la barra de busqueda que se pueda buscar por cargo al que se postula
8. modulo ofertas
    1. cambiar nombre por Solicitudes de personal
    2. boton crear oferta no hace nada, cambiar nombre por Nueva Solicitud
9. modulo roles
    1. mostrar la jerarquia de roles de sistema como una lista de dos columnas, que ocupe menos espacio
    2. al editar un rol, no se esta haciendo efectivo el cambio. el cambio aca tambien debe reflejarse en el modulo de empleados y viceversa.
    3. aquellos empleados con el rol “Empleado” no tienen acceso al sistema, sin excepcion