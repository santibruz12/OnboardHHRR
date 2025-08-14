## INSTRUCCIONES COMPLETAS DE DESARROLLO - OnBoard HHRR

### 📋 CONFIGURACIÓN INICIAL DEL PROYECTO EN REPLIT

#### 1. Creación del Repl
```bash
# 1. Crear nuevo Repl en Replit.com
# 2. Seleccionar template: "Next.js" 
# 3. Nombrar: "onboard-hhrr-app"
# 4. Configurar como privado
```

#### 2. Estructura de Directorios Obligatoria
```
onboard-hhrr-app/
├── .env.local                 # Variables de entorno (NUNCA commitear)
├── .env.example              # Template de variables de entorno
├── .gitignore               # Configuración git
├── .replit                  # Configuración específica Replit
├── replit.nix              # Dependencias del sistema
├── next.config.js          # Configuración Next.js
├── package.json            # Dependencias del proyecto
├── tailwind.config.js      # Configuración Tailwind
├── tsconfig.json           # Configuración TypeScript
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   └── migrations/         # Migraciones de DB
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Rutas de autenticación
│   │   ├── (dashboard)/   # Rutas del dashboard
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Estilos globales
│   │   ├── layout.tsx     # Layout principal
│   │   └── page.tsx       # Página principal
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/           # Componentes base (shadcn/ui)
│   │   ├── forms/        # Formularios específicos
│   │   ├── layouts/      # Layouts específicos
│   │   └── common/       # Componentes comunes
│   ├── features/         # Módulos por funcionalidad
│   │   ├── auth/         # Autenticación
│   │   ├── employees/    # Gestión empleados
│   │   ├── contracts/    # Gestión contratos
│   │   ├── dashboard/    # Dashboard
│   │   └── admin/        # Administración
│   ├── lib/              # Utilidades y configuraciones
│   │   ├── prisma.ts     # Cliente Prisma
│   │   ├── auth.ts       # Configuración auth
│   │   ├── utils.ts      # Utilidades generales
│   │   └── validators.ts # Validadores Zod
│   ├── hooks/            # Custom React hooks
│   ├── types/            # Definiciones TypeScript
│   └── constants/        # Constantes de la aplicación
├── tests/                # Testing
│   ├── __mocks__/       # Mocks para testing
│   ├── unit/            # Tests unitarios
│   ├── integration/     # Tests integración
│   └── e2e/             # Tests end-to-end
└── docs/                # Documentación
    ├── api.md           # Documentación API
    ├── database.md      # Documentación DB
    └── deployment.md    # Guía de despliegue
```

#### 3. Configuración de Archivos Base

**`.replit`**
```toml
run = "npm run dev"
modules = ["nodejs-18"]

[deployment]
run = ["sh", "-c", "npm run start"]

[[ports]]
localPort = 3000
externalPort = 80
```

**`replit.nix`**
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.git
  ];
}
```

**`package.json`** (Dependencias obligatorias)
```json
{
  "name": "onboard-hhrr-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "next-auth": "^4.24.0",
    "@next-auth/prisma-adapter": "^1.0.7",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "tailwindcss": "^3.3.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0",
    "lucide-react": "^0.292.0",
    "react-hot-toast": "^2.4.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tooltip": "^1.0.7",
    "date-fns": "^2.30.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "crypto-js": "^4.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/crypto-js": "^4.2.1",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "prettier": "^3.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0",
    "jest-environment-jsdom": "^29.0.0",
    "tsx": "^4.0.0"
  }
}
```

#### 4. Variables de Entorno (.env.example)
```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Encryption
ENCRYPTION_KEY="your-encryption-key-32-chars"

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🚀 REGLAS DE DESARROLLO OBLIGATORIAS

### REGLA #1: CONTROL DE VERSIONES
```bash
# ✅ OBLIGATORIO: Commits descriptivos en español
git commit -m "feat(auth): implementar autenticación con NextAuth"
git commit -m "fix(employees): corregir validación de cédula venezolana"
git commit -m "refactor(dashboard): optimizar queries de indicadores"

# ❌ PROHIBIDO: Commits genéricos
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

**Prefijos obligatorios:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización sin cambio funcional
- `style:` Cambios de formato/estilo
- `test:` Añadir/modificar tests
- `docs:` Documentación
- `chore:` Tareas de mantenimiento

### REGLA #2: TIPADO ESTRICTO
```typescript
// ✅ OBLIGATORIO: TypeScript estricto
interface Employee {
  id: number;
  cedula: string;
  nombre: string;
  departamento: Department;
  supervisor?: Employee;
}

// ❌ PROHIBIDO: Uso de 'any'
const data: any = response.data; // NO PERMITIDO

// ✅ CORRECTO: Tipado específico
const data: Employee[] = response.data;
```

### REGLA #3: VALIDACIÓN DE DATOS
```typescript
// ✅ OBLIGATORIO: Validación con Zod
import { z } from 'zod';

const EmpleadoSchema = z.object({
  cedula: z.string().regex(/^[VE]-\d{7,8}$/, "Formato de cédula inválido"),
  nombre: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  correo: z.string().email("Email inválido"),
  departamentoId: z.number().positive("ID departamento inválido")
});

// Usar en API routes
export async function POST(request: Request) {
  const body = await request.json();
  const validation = EmpleadoSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: validation.error.errors },
      { status: 400 }
    );
  }
  // Procesar datos validados...
}
```

### REGLA #4: MANEJO DE ERRORES
```typescript
// ✅ OBLIGATORIO: Try-catch en todas las operaciones async
async function createEmployee(data: CreateEmployeeData) {
  try {
    const employee = await prisma.empleados.create({
      data: {
        ...data,
        created_at: new Date()
      }
    });
    
    // Log de auditoría obligatorio
    await auditLog({
      table: 'empleados',
      action: 'CREATE',
      recordId: employee.ID_Empleado,
      userId: data.createdBy
    });
    
    return { success: true, data: employee };
  } catch (error) {
    console.error('[CREATE_EMPLOYEE_ERROR]', error);
    
    // Log de error obligatorio
    await errorLog({
      operation: 'create_employee',
      error: error.message,
      data: data,
      timestamp: new Date()
    });
    
    return { success: false, error: 'Error al crear empleado' };
  }
}
```

### REGLA #5: SEGURIDAD OBLIGATORIA
```typescript
// ✅ OBLIGATORIO: Verificación de permisos en cada API route
import { verifyPermissions } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  
  const hasPermission = await verifyPermissions(
    session.user.id,
    'employees',
    'create'
  );
  
  if (!hasPermission) {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
  }
  
  // Proceder con la operación...
}

// ✅ OBLIGATORIO: Sanitización de inputs
import { sanitizeInput } from '@/lib/sanitize';

const sanitizedData = {
  nombre: sanitizeInput(body.nombre),
  correo: sanitizeInput(body.correo).toLowerCase()
};
```

### REGLA #6: TESTING OBLIGATORIO
```typescript
// ✅ OBLIGATORIO: Test unitario para cada función crítica
// tests/unit/validators.test.ts
import { validateCedula } from '@/lib/validators';

describe('Venezuelan Validators', () => {
  describe('validateCedula', () => {
    it('should validate Venezuelan cedula correctly', () => {
      expect(validateCedula('V-12345678')).toBe(true);
      expect(validateCedula('E-87654321')).toBe(true);
      expect(validateCedula('V-123')).toBe(false);
      expect(validateCedula('X-12345678')).toBe(false);
    });
  });
});

// ✅ OBLIGATORIO: Test de integración para APIs
// tests/integration/employees.test.ts
import { POST } from '@/app/api/employees/route';

describe('/api/employees', () => {
  it('should create employee with valid data', async () => {
    const mockRequest = new Request('http://localhost:3000/api/employees', {
      method: 'POST',
      body: JSON.stringify({
        cedula: 'V-12345678',
        nombre: 'Juan Pérez',
        correo: 'juan@empresa.com'
      })
    });
    
    const response = await POST(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
```

### REGLA #7: PERFORMANCE Y OPTIMIZACIÓN
```typescript
// ✅ OBLIGATORIO: Lazy loading de componentes pesados
import dynamic from 'next/dynamic';

const EmployeeDashboard = dynamic(
  () => import('@/components/EmployeeDashboard'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false // Solo si es necesario
  }
);

// ✅ OBLIGATORIO: Queries optimizadas con includes específicos
const employee = await prisma.empleados.findUnique({
  where: { ID_Empleado: id },
  select: {
    ID_Empleado: true,
    Nombre: true,
    Cedula: true,
    Departamento: {
      select: {
        Nombre_Departamento: true,
        Gerencia: {
          select: {
            Nombre_Gerencia: true
          }
        }
      }
    }
  }
});
```

### REGLA #8: DOCUMENTACIÓN OBLIGATORIA
```typescript
/**
 * Crea un nuevo empleado en el sistema
 * @param data - Datos del empleado a crear
 * @param userId - ID del usuario que crea el registro
 * @returns Promise con el resultado de la operación
 * @throws Error si la cédula ya existe o datos inválidos
 * 
 * @example
 * ```typescript
 * const result = await createEmployee({
 *   cedula: 'V-12345678',
 *   nombre: 'Juan Pérez',
 *   departamentoId: 1
 * }, session.user.id);
 * ```
 */
async function createEmployee(
  data: CreateEmployeeData, 
  userId: number
): Promise<OperationResult<Employee>> {
  // Implementación...
}
```

---

