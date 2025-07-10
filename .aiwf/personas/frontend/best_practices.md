# Frontend 페르소나 Best Practices

## 개요
Frontend 페르소나는 사용자 경험(UX)과 인터페이스 디자인을 최우선으로 고려합니다. 성능, 접근성, 반응형 디자인에 중점을 둡니다.

## 핵심 원칙

### 1. 사용자 중심 디자인
- 직관적인 인터페이스 설계
- 일관된 디자인 시스템 구축
- 피드백과 상태 표시 명확히

### 2. 성능 최적화
```javascript
// Lazy Loading 구현
const LazyImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const imageRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => observer.disconnect();
  }, [src]);
  
  return (
    <img 
      ref={imageRef}
      src={imageSrc || '/placeholder.svg'} 
      alt={alt}
      loading="lazy"
    />
  );
};
```

### 3. 접근성 (Accessibility)
```jsx
// ARIA 속성 활용
<button
  aria-label="메뉴 열기"
  aria-expanded={isMenuOpen}
  aria-controls="navigation-menu"
  onClick={toggleMenu}
>
  <MenuIcon />
</button>

// 키보드 네비게이션 지원
const handleKeyDown = (e) => {
  switch(e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleClick();
      break;
    case 'Escape':
      handleClose();
      break;
  }
};
```

## 컴포넌트 설계

### 재사용 가능한 컴포넌트
```jsx
// Compound Component Pattern
const Accordion = ({ children }) => {
  const [openIndex, setOpenIndex] = useState(null);
  
  return (
    <AccordionContext.Provider value={{ openIndex, setOpenIndex }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
};

Accordion.Item = ({ index, children }) => {
  const { openIndex, setOpenIndex } = useAccordion();
  const isOpen = openIndex === index;
  
  return (
    <div className="accordion-item">
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen, toggle: () => setOpenIndex(index) })
      )}
    </div>
  );
};

Accordion.Header = ({ children, toggle }) => (
  <button className="accordion-header" onClick={toggle}>
    {children}
  </button>
);

Accordion.Content = ({ children, isOpen }) => (
  <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
    {children}
  </div>
);
```

### 상태 관리 패턴
```javascript
// Custom Hook for Complex State
function useFormState(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 실시간 검증
    if (touched[name]) {
      const error = validationRules[name]?.(value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validationRules]);
  
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validationRules[name]?.(values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validationRules]);
  
  const validateAll = useCallback(() => {
    const newErrors = {};
    Object.keys(validationRules).forEach(name => {
      const error = validationRules[name](values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);
  
  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll
  };
}
```

## 스타일링 Best Practices

### CSS-in-JS vs CSS Modules
```javascript
// Styled Components (CSS-in-JS)
const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// CSS Modules
// Button.module.css
.button {
  composes: base from './base.module.css';
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
}

.button:hover {
  opacity: 0.9;
}

// Component
import styles from './Button.module.css';
const Button = ({ children, ...props }) => (
  <button className={styles.button} {...props}>
    {children}
  </button>
);
```

### 반응형 디자인
```css
/* Mobile First Approach */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 2rem;
  }
}

/* Utility Classes */
.hide-mobile { display: none; }
.show-tablet { display: none; }

@media (min-width: 768px) {
  .hide-mobile { display: block; }
  .show-tablet { display: block; }
}
```

## 성능 최적화

### 번들 크기 최적화
```javascript
// Dynamic Imports
const HeavyComponent = lazy(() => 
  import(/* webpackChunkName: "heavy" */ './HeavyComponent')
);

// Tree Shaking을 위한 Named Exports
// utils.js
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Import only what you need
import { debounce } from './utils';
```

### 렌더링 최적화
```jsx
// React.memo로 불필요한 리렌더링 방지
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});

// useMemo for expensive calculations
const ProcessedData = ({ rawData }) => {
  const processed = useMemo(() => {
    return rawData
      .filter(item => item.active)
      .map(item => ({
        ...item,
        computed: expensiveComputation(item)
      }))
      .sort((a, b) => b.computed - a.computed);
  }, [rawData]);
  
  return <DataTable data={processed} />;
};
```

## 테스팅 전략

### 컴포넌트 테스트
```javascript
// React Testing Library
describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be keyboard accessible', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    await userEvent.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### E2E 테스트
```javascript
// Cypress
describe('User Flow', () => {
  it('should complete checkout process', () => {
    cy.visit('/products');
    
    // 제품 선택
    cy.findByText('Add to Cart').click();
    
    // 장바구니 확인
    cy.findByLabelText('Cart').click();
    cy.findByText('Proceed to Checkout').click();
    
    // 결제 정보 입력
    cy.findByLabelText('Email').type('user@example.com');
    cy.findByLabelText('Card Number').type('4242424242424242');
    
    // 주문 완료
    cy.findByText('Place Order').click();
    cy.findByText('Order Confirmed').should('be.visible');
  });
});
```

## 보안 고려사항

### XSS 방지
```jsx
// 위험한 HTML 렌더링 피하기
// 나쁜 예
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// 좋은 예
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userContent) 
}} />

// 또는 텍스트로만 렌더링
<div>{userContent}</div>
```

### 민감한 정보 보호
```javascript
// 환경 변수 사용
const API_KEY = process.env.REACT_APP_API_KEY;

// 민감한 정보 로깅 방지
const sanitizeUser = (user) => {
  const { password, ssn, ...safeUser } = user;
  return safeUser;
};

console.log('User data:', sanitizeUser(userData));
```

## 개발 도구

### 필수 도구
- **번들러**: Vite, Webpack
- **상태관리**: Redux Toolkit, Zustand, Jotai
- **스타일링**: Tailwind CSS, Emotion, Styled Components
- **테스팅**: Jest, React Testing Library, Cypress
- **린팅**: ESLint, Prettier

### 성능 모니터링
```javascript
// Web Vitals 측정
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Google Analytics로 전송
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 체크리스트

### 개발 전
- [ ] 디자인 시스템 확인
- [ ] 반응형 브레이크포인트 정의
- [ ] 접근성 요구사항 검토
- [ ] 성능 목표 설정

### 개발 중
- [ ] 컴포넌트 재사용성 검토
- [ ] 접근성 테스트 (스크린 리더, 키보드)
- [ ] 크로스 브라우저 테스트
- [ ] 성능 프로파일링

### 배포 전
- [ ] 번들 크기 최적화
- [ ] 이미지 최적화
- [ ] SEO 메타 태그
- [ ] 에러 경계 설정
- [ ] 분석 도구 통합