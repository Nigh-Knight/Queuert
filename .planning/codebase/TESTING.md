# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- Not configured yet
- No Jest, Vitest, or other test runner installed
- Test dependencies not found in `package.json`

**Assertion Library:**
- Not configured yet

**Run Commands:**
- None available; testing infrastructure not yet set up

## Test File Organization

**Location:**
- No test files exist in source code (`src/`, `components/`, `convex/`)
- Test infrastructure ready to be implemented as project progresses
- Recommended pattern (for future implementation): Co-locate tests with source files

**Naming:**
- Recommended convention: `ComponentName.test.tsx` or `ComponentName.spec.tsx`
- Hook tests: `useThemeColor.test.ts` or `useThemeColor.spec.ts`
- Convex function tests: `intake.test.ts` or `intake.spec.ts`

**Structure:**
- Suggested structure (not yet implemented):
```
components/
├── provider/
│   ├── atoms/
│   │   ├── CustomButton.tsx
│   │   └── CustomButton.test.tsx
│   ├── screens/
│   │   ├── RegistrationFormScreen.tsx
│   │   └── RegistrationFormScreen.test.tsx
convex/
├── intake.ts
└── intake.test.ts
```

## Test Structure

**Suite Organization:**
- Not yet implemented
- Recommended structure (following Expo/React Native standards):
```typescript
describe('CustomButton', () => {
  describe('rendering', () => {
    it('should render with label', () => {
      // test
    });
  });

  describe('interactions', () => {
    it('should call onPress when tapped', () => {
      // test
    });
  });

  describe('disabled state', () => {
    it('should not respond to taps when disabled', () => {
      // test
    });
  });
});
```

**Patterns to implement:**
- Setup/teardown: Use `beforeEach()`/`afterEach()` for component setup
- Assertions: Use standard expect() syntax
- Component testing: Use React Native Testing Library patterns (not installed yet)

## Mocking

**Framework:**
- Not configured yet
- Recommended: Jest mocks for Convex functions and React Native modules

**Patterns to implement:**
```typescript
// Mock Convex functions
jest.mock('@/convex/_generated/api', () => ({
  api: {
    submitIntakeForm: jest.fn(),
    getActiveQueue: jest.fn(),
  },
}));

// Mock React Native modules
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  StyleSheet: {
    create: (styles) => styles,
  },
}));
```

**What to Mock:**
- Convex mutations and queries (not API calls in testing)
- Navigation stack and navigation functions
- External APIs (when integrated)
- Async operations (setTimeout, fetch)

**What NOT to Mock:**
- React components (render directly)
- StyleSheet.create() or style objects
- Theme constants from `@/constants/theme`
- Built-in React Native components

## Fixtures and Factories

**Test Data:**
- Not yet implemented
- Recommended pattern (for future implementation):
```typescript
// Create reusable test data
const createMockUser = (overrides = {}) => ({
  _id: 'user123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '555-1234',
  role: 'service_user',
  ...overrides,
});

const createMockQueue = (overrides = {}) => ({
  _id: 'queue123',
  serviceUserId: 'user123',
  position: 1,
  status: 'waiting',
  joinedAt: Date.now(),
  timerDuration: 23 * 60 * 1000,
  ...overrides,
});
```

**Location:**
- Suggested: `__tests__/fixtures/` directory
- Or inline in test files for simple cases
- One factory per entity type

## Coverage

**Requirements:**
- Not enforced yet
- Recommended target: 80% for critical paths (authentication, queue management)

**View Coverage:**
- Once test framework configured, run: `npm test -- --coverage`

## Test Types

**Unit Tests (to implement):**
- Test individual components like atoms (`CustomButton`, `InputField`, `Header`)
- Test utility functions like `formatPhoneNumber()`
- Test hooks like `useThemeColor()` and `useColorScheme()`
- Scope: Single component or function in isolation
- Mock all dependencies (navigation, API calls)

**Integration Tests (to implement):**
- Test full screen flows: `RoleSelectionScreen` -> `PhoneInputScreen` -> `VerificationScreen`
- Test component composition: `RegistrationFormScreen` combining atoms
- Test Convex mutations affecting queue state
- Scope: Multiple components working together
- Mock external APIs but not inter-component calls

**E2E Tests:**
- Not yet implemented
- Recommended: Detox or Maestro for React Native
- Would test complete user flows: role selection -> phone input -> registration -> queue viewing
- Currently running Expo in development covers manual E2E testing

## Common Patterns

**Async Testing (to implement):**
```typescript
describe('PhoneInputScreen', () => {
  it('should call onPhoneSubmit after timeout', async () => {
    const mockOnPhoneSubmit = jest.fn();
    render(
      <PhoneInputScreen
        onPhoneSubmit={mockOnPhoneSubmit}
      />
    );

    // User interactions
    fireEvent.changeText(phoneInput, '5551234567');
    fireEvent.press(continueButton);

    // Wait for async operation
    await waitFor(() => {
      expect(mockOnPhoneSubmit).toHaveBeenCalledWith('+1', '5551234567');
    }, { timeout: 1500 });
  });
});
```

**Error Testing (to implement):**
```typescript
describe('InputField', () => {
  it('should display error message when provided', () => {
    const { getByText } = render(
      <InputField
        label="Phone Number"
        errorMessage="Invalid phone number"
      />
    );

    expect(getByText('Invalid phone number')).toBeTruthy();
  });

  it('should apply error styles to input', () => {
    const { getByTestId } = render(
      <InputField
        testID="phoneInput"
        errorMessage="Required"
      />
    );

    const input = getByTestId('phoneInput');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: Colors.alert })
    );
  });
});
```

**State Testing (to implement):**
```typescript
describe('RegistrationFormScreen', () => {
  it('should disable submit button when form is invalid', () => {
    const mockOnSubmit = jest.fn();
    const { getByTestId } = render(
      <RegistrationFormScreen onSubmit={mockOnSubmit} />
    );

    const submitButton = getByTestId('submitButton');
    expect(submitButton.props.disabled).toBe(true);

    // Fill form
    fireEvent.changeText(firstNameInput, 'John');
    fireEvent.changeText(lastNameInput, 'Doe');
    fireEvent.changeText(loadsInput, '3');
    fireEvent.changeText(weightInput, '50');

    // Button should enable
    expect(submitButton.props.disabled).toBe(false);
  });
});
```

## Testing Convex Functions (to implement)

**Pattern for mutations:**
```typescript
describe('submitIntakeForm', () => {
  it('should insert intake form and add user to queue', async () => {
    const mockCtx = {
      db: {
        insert: jest.fn().mockResolvedValue('formId123'),
        query: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnThis(),
          collect: jest.fn().mockResolvedValue([]),
        }),
      },
    };

    const result = await submitIntakeForm.handler(mockCtx, {
      serviceUserId: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      livingCondition: 'homeless',
      estimatedLaundryLoads: 3,
      estimatedLaundryWeightLbs: 50,
      sessionId: 'session123',
    });

    expect(mockCtx.db.insert).toHaveBeenCalledWith('intakeForms', expect.any(Object));
    expect(mockCtx.db.insert).toHaveBeenCalledWith('queue', expect.any(Object));
    expect(result).toBe('formId123');
  });
});
```

**Pattern for queries:**
```typescript
describe('getActiveQueue', () => {
  it('should return queue items with populated user and intake data', async () => {
    const mockCtx = {
      db: {
        query: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          collect: jest.fn().mockResolvedValue([
            { _id: 'queue1', serviceUserId: 'user1', intakeFormId: 'form1' },
          ]),
          get: jest.fn().mockResolvedValue({ firstName: 'John' }),
        }),
      },
    };

    const result = await getActiveQueue.handler(mockCtx, {
      sessionId: 'session123',
    });

    expect(result).toHaveLength(1);
    expect(result[0].user).toBeDefined();
    expect(result[0].intake).toBeDefined();
  });
});
```

## Testing Hooks (to implement)

**Pattern for custom hooks:**
```typescript
describe('useThemeColor', () => {
  it('should return light theme color when scheme is light', () => {
    // Mock useColorScheme
    jest.mock('@/hooks/use-color-scheme', () => ({
      useColorScheme: jest.fn().mockReturnValue('light'),
    }));

    const { result } = renderHook(() =>
      useThemeColor({}, 'text')
    );

    expect(result.current).toBe(Colors.light.text);
  });

  it('should prefer prop color over theme color', () => {
    const { result } = renderHook(() =>
      useThemeColor({ light: '#FF0000' }, 'text')
    );

    expect(result.current).toBe('#FF0000');
  });
});
```

## Setup Recommendations

**Next steps to implement testing:**
1. Install test runner: `npm install --save-dev jest @types/jest` or `npm install --save-dev vitest`
2. Install React Native testing tools: `npm install --save-dev @testing-library/react-native @testing-library/jest-native`
3. Create Jest/Vitest config file
4. Add test scripts to `package.json`:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage"
   }
   ```
5. Create `__tests__` directories or co-locate `.test.tsx` files
6. Start with unit tests for atom components (CustomButton, InputField)
7. Add integration tests for screen flows
8. Set up CI/CD to run tests on each commit

---

*Testing analysis: 2026-01-23*
