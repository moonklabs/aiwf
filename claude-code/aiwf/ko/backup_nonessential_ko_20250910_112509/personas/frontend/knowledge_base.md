# Frontend 페르소나 Knowledge Base

## 모던 프레임워크 가이드

### React 18+ 최신 기능

#### Concurrent Features
```jsx
// Suspense for Data Fetching
const ProfilePage = () => {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileDetails />
      <Suspense fallback={<PostsSkeleton />}>
        <ProfilePosts />
      </Suspense>
    </Suspense>
  );
};

// useTransition for Non-urgent Updates
const SearchResults = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (e) => {
    setQuery(e.target.value);
    
    startTransition(() => {
      // 검색 결과 업데이트는 낮은 우선순위
      setResults(searchDatabase(e.target.value));
    });
  };
  
  return (
    <>
      <input value={query} onChange={handleSearch} />
      {isPending && <Spinner />}
      <SearchResultsList results={results} />
    </>
  );
};

// useDeferredValue for Debouncing
const DebouncedResults = ({ query }) => {
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(
    () => expensiveSearch(deferredQuery),
    [deferredQuery]
  );
  
  return <ResultsList results={results} />;
};
```

#### Server Components
```jsx
// app/page.server.jsx (Server Component)
async function BlogPost({ id }) {
  // 서버에서 직접 데이터 페칭
  const post = await db.posts.findUnique({ where: { id } });
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      <ClientInteractions postId={id} />
    </article>
  );
}

// app/ClientInteractions.client.jsx (Client Component)
'use client';

function ClientInteractions({ postId }) {
  const [likes, setLikes] = useState(0);
  
  return (
    <button onClick={() => setLikes(l => l + 1)}>
      좋아요 {likes}
    </button>
  );
}
```

### Vue 3 Composition API

#### Composables 패턴
```javascript
// useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  const double = computed(() => count.value * 2);
  
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  return {
    count,
    double,
    increment,
    decrement
  };
}

// Component.vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ double }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup>
import { useCounter } from './useCounter';

const { count, double, increment, decrement } = useCounter(10);
</script>
```

#### Reactive State Management
```javascript
// store/userStore.js
import { reactive, readonly } from 'vue';

const state = reactive({
  user: null,
  isLoading: false,
  error: null
});

const actions = {
  async fetchUser(userId) {
    state.isLoading = true;
    state.error = null;
    
    try {
      const response = await api.getUser(userId);
      state.user = response.data;
    } catch (error) {
      state.error = error.message;
    } finally {
      state.isLoading = false;
    }
  },
  
  logout() {
    state.user = null;
  }
};

export function useUserStore() {
  return {
    state: readonly(state),
    ...actions
  };
}
```

## 상태 관리 패턴

### Redux Toolkit
```javascript
// features/cart/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (userId) => {
    const response = await api.getCart(userId);
    return response.data;
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(
        item => item.id !== action.payload
      );
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(
        item => item.id === action.payload.id
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { addItem, removeItem, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
```

### Zustand
```javascript
// stores/useAppStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useAppStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        theme: 'light',
        notifications: [],
        
        // Actions
        setUser: (user) => set({ user }),
        
        toggleTheme: () => set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),
        
        addNotification: (notification) => set((state) => ({
          notifications: [...state.notifications, {
            id: Date.now(),
            ...notification
          }]
        })),
        
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
        
        // Computed/Derived state
        get hasUnreadNotifications() {
          return get().notifications.some(n => !n.read);
        }
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ user: state.user, theme: state.theme })
      }
    )
  )
);
```

## CSS 아키텍처

### CSS Custom Properties (CSS Variables)
```css
/* Design Tokens */
:root {
  /* Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  
  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', monospace;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Animations */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}

/* Dark Mode */
[data-theme="dark"] {
  --color-primary-50: #1e3a8a;
  --color-primary-500: #60a5fa;
}

/* Component using tokens */
.button {
  background: var(--color-primary-500);
  padding: var(--space-sm) var(--space-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}
```

### CSS Grid Layout Systems
```css
/* Responsive Grid System */
.grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Advanced Grid Layout */
.dashboard {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 300px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* Responsive adjustment */
@media (max-width: 768px) {
  .dashboard {
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

## 성능 최적화 기법

### 이미지 최적화
```jsx
// Next.js Image Component
import Image from 'next/image';

const OptimizedImage = () => (
  <Image
    src="/hero.jpg"
    alt="Hero image"
    width={1200}
    height={600}
    priority // LCP 이미지에 사용
    placeholder="blur"
    blurDataURL={shimmer}
    sizes="(max-width: 768px) 100vw,
           (max-width: 1200px) 50vw,
           33vw"
  />
);

// Progressive Image Loading
const ProgressiveImage = ({ src, placeholder, alt }) => {
  const [imgSrc, setImgSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
  }, [src]);
  
  return (
    <div className={`image-wrapper ${isLoaded ? 'loaded' : ''}`}>
      <img src={imgSrc} alt={alt} />
    </div>
  );
};
```

### 웹 워커 활용
```javascript
// worker.js
self.addEventListener('message', (e) => {
  const { type, data } = e.data;
  
  switch(type) {
    case 'PROCESS_DATA':
      const result = expensiveDataProcessing(data);
      self.postMessage({ type: 'DATA_PROCESSED', result });
      break;
      
    case 'GENERATE_REPORT':
      const report = generateComplexReport(data);
      self.postMessage({ type: 'REPORT_READY', report });
      break;
  }
});

// Main thread
const worker = new Worker('/worker.js');

worker.postMessage({ 
  type: 'PROCESS_DATA', 
  data: largeDataset 
});

worker.addEventListener('message', (e) => {
  if (e.data.type === 'DATA_PROCESSED') {
    updateUI(e.data.result);
  }
});
```

## 접근성 구현

### ARIA 패턴
```jsx
// Accessible Modal
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef();
  const previousActiveElement = useRef();
  
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 id="modal-title">{title}</h2>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};
```

### 폼 접근성
```jsx
// Accessible Form with Validation
const AccessibleForm = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">
          이메일 <span aria-label="필수">*</span>
        </label>
        <input
          id="email"
          type="email"
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          onBlur={() => handleBlur('email')}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="error">
            {errors.email}
          </span>
        )}
      </div>
      
      <fieldset>
        <legend>알림 설정</legend>
        <div className="radio-group" role="radiogroup">
          <input
            type="radio"
            id="notify-all"
            name="notifications"
            value="all"
          />
          <label htmlFor="notify-all">모든 알림 받기</label>
          
          <input
            type="radio"
            id="notify-important"
            name="notifications"
            value="important"
          />
          <label htmlFor="notify-important">중요 알림만</label>
          
          <input
            type="radio"
            id="notify-none"
            name="notifications"
            value="none"
          />
          <label htmlFor="notify-none">알림 받지 않기</label>
        </div>
      </fieldset>
      
      <button type="submit">제출</button>
    </form>
  );
};
```

## 데이터 시각화

### Chart.js 고급 활용
```javascript
// Responsive & Interactive Chart
const InteractiveChart = ({ data }) => {
  const chartRef = useRef();
  const [chartInstance, setChartInstance] = useState(null);
  
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: '매출',
          data: data.values,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: ${
                  new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                  }).format(context.parsed.y)
                }`;
              }
            }
          },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x'
            },
            pan: {
              enabled: true,
              mode: 'x'
            }
          }
        }
      }
    });
    
    setChartInstance(chart);
    
    return () => chart.destroy();
  }, [data]);
  
  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
};
```

### D3.js 커스텀 시각화
```javascript
// Interactive Force-Directed Graph
const ForceGraph = ({ nodes, links }) => {
  const svgRef = useRef();
  
  useEffect(() => {
    const width = 800;
    const height = 600;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Clear previous render
    svg.selectAll('*').remove();
    
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6);
    
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.size || 5)
      .attr('fill', d => d.color || '#69b3a2')
      .call(drag(simulation));
    
    node.append('title')
      .text(d => d.label);
    
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
    
    function drag(simulation) {
      return d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }
  }, [nodes, links]);
  
  return <svg ref={svgRef} />;
};
```