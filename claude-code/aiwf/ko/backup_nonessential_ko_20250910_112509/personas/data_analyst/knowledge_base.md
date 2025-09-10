# Data Analyst 페르소나 Knowledge Base

## 데이터 분석 도구 및 라이브러리

### Python 데이터 분석 스택

#### Pandas 고급 기능
```python
import pandas as pd
import numpy as np

# 1. 멀티 인덱싱
df = pd.DataFrame({
    'date': pd.date_range('2024-01-01', periods=100),
    'category': np.random.choice(['A', 'B', 'C'], 100),
    'subcategory': np.random.choice(['X', 'Y'], 100),
    'value': np.random.randn(100),
    'quantity': np.random.randint(1, 100, 100)
})

# 멀티 인덱스 생성
df_multi = df.set_index(['category', 'subcategory'])

# 멀티 인덱스 접근
df_multi.loc[('A', 'X')]  # 특정 조합
df_multi.xs('X', level='subcategory')  # 특정 레벨

# 2. Window Functions
# 이동 평균
df['ma_7'] = df.groupby('category')['value'].transform(
    lambda x: x.rolling(7, min_periods=1).mean()
)

# 누적 합계
df['cumsum'] = df.groupby('category')['value'].cumsum()

# Expanding window
df['expanding_mean'] = df.groupby('category')['value'].expanding().mean()

# 3. 피벗 테이블 고급 기능
pivot_table = pd.pivot_table(
    df,
    values=['value', 'quantity'],
    index=['date'],
    columns=['category'],
    aggfunc={
        'value': ['mean', 'std'],
        'quantity': 'sum'
    },
    fill_value=0,
    margins=True,
    margins_name='Total'
)

# 4. 시계열 리샘플링
df_ts = df.set_index('date')
monthly_summary = df_ts.resample('M').agg({
    'value': ['sum', 'mean', 'std'],
    'quantity': 'sum'
})

# 5. 메모리 최적화
def optimize_dataframe(df):
    """데이터프레임 메모리 사용량 최적화"""
    for col in df.columns:
        col_type = df[col].dtype
        
        if col_type != 'object':
            c_min = df[col].min()
            c_max = df[col].max()
            
            if str(col_type)[:3] == 'int':
                if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                    df[col] = df[col].astype(np.int8)
                elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                    df[col] = df[col].astype(np.int16)
                elif c_min > np.iinfo(np.int32).min and c_max < np.iinfo(np.int32).max:
                    df[col] = df[col].astype(np.int32)
            else:
                if c_min > np.finfo(np.float16).min and c_max < np.finfo(np.float16).max:
                    df[col] = df[col].astype(np.float16)
                elif c_min > np.finfo(np.float32).min and c_max < np.finfo(np.float32).max:
                    df[col] = df[col].astype(np.float32)
        else:
            df[col] = df[col].astype('category')
    
    return df
```

#### NumPy 고급 연산
```python
# 1. Broadcasting
a = np.array([[1, 2, 3], [4, 5, 6]])
b = np.array([10, 20, 30])
result = a + b  # Broadcasting 적용

# 2. 벡터화 연산
@np.vectorize
def custom_function(x):
    if x > 0:
        return np.log(x)
    else:
        return 0

vectorized_result = custom_function(np.array([-1, 0, 1, 2, 3]))

# 3. 고급 인덱싱
arr = np.random.randn(10, 10)
mask = arr > 0
positive_values = arr[mask]

# Fancy indexing
rows = np.array([0, 2, 4])
cols = np.array([1, 3, 5])
selected = arr[rows[:, np.newaxis], cols]

# 4. 선형대수 연산
# 고유값 분해
eigenvalues, eigenvectors = np.linalg.eig(arr)

# 특이값 분해 (SVD)
U, s, Vt = np.linalg.svd(arr)

# 5. 통계 함수
# 백분위수
percentiles = np.percentile(arr, [25, 50, 75], axis=0)

# 상관계수 행렬
correlation_matrix = np.corrcoef(arr.T)
```

### SQL 고급 쿼리

#### 윈도우 함수
```sql
-- 1. 순위 함수
WITH sales_ranking AS (
    SELECT 
        product_id,
        sale_date,
        amount,
        ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY amount DESC) as row_num,
        RANK() OVER (PARTITION BY product_id ORDER BY amount DESC) as rank,
        DENSE_RANK() OVER (PARTITION BY product_id ORDER BY amount DESC) as dense_rank,
        PERCENT_RANK() OVER (PARTITION BY product_id ORDER BY amount DESC) as percent_rank
    FROM sales
)
SELECT * FROM sales_ranking WHERE row_num <= 10;

-- 2. 이동 평균 및 누적 합계
SELECT 
    date,
    revenue,
    -- 7일 이동 평균
    AVG(revenue) OVER (
        ORDER BY date 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as ma_7,
    -- 누적 합계
    SUM(revenue) OVER (
        ORDER BY date 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) as cumulative_revenue,
    -- 전월 대비 성장률
    LAG(revenue, 1) OVER (ORDER BY date) as prev_revenue,
    (revenue - LAG(revenue, 1) OVER (ORDER BY date)) / 
    NULLIF(LAG(revenue, 1) OVER (ORDER BY date), 0) * 100 as growth_rate
FROM daily_revenue;

-- 3. 고급 집계
WITH monthly_stats AS (
    SELECT 
        DATE_TRUNC('month', order_date) as month,
        category,
        COUNT(DISTINCT customer_id) as unique_customers,
        COUNT(*) as total_orders,
        SUM(amount) as total_revenue,
        AVG(amount) as avg_order_value,
        STDDEV(amount) as stddev_order_value
    FROM orders
    GROUP BY DATE_TRUNC('month', order_date), category
),
category_percentiles AS (
    SELECT 
        month,
        category,
        total_revenue,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_revenue) 
            OVER (PARTITION BY month) as q1,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY total_revenue) 
            OVER (PARTITION BY month) as median,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_revenue) 
            OVER (PARTITION BY month) as q3
    FROM monthly_stats
)
SELECT * FROM category_percentiles;

-- 4. 재귀 CTE (계층 구조)
WITH RECURSIVE category_hierarchy AS (
    -- Base case
    SELECT 
        id,
        name,
        parent_id,
        0 as level,
        name as path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case
    SELECT 
        c.id,
        c.name,
        c.parent_id,
        ch.level + 1,
        ch.path || ' > ' || c.name
    FROM categories c
    JOIN category_hierarchy ch ON c.parent_id = ch.id
)
SELECT * FROM category_hierarchy ORDER BY path;
```

### 통계 분석 기법

#### 가설 검정
```python
from scipy import stats
import statsmodels.api as sm
from statsmodels.stats.multicomp import pairwise_tukeyhsd

class StatisticalTesting:
    @staticmethod
    def normality_tests(data):
        """정규성 검정"""
        results = {}
        
        # Shapiro-Wilk test
        stat, p_value = stats.shapiro(data)
        results['shapiro'] = {
            'statistic': stat,
            'p_value': p_value,
            'is_normal': p_value > 0.05
        }
        
        # Kolmogorov-Smirnov test
        stat, p_value = stats.kstest(data, 'norm', 
                                     args=(data.mean(), data.std()))
        results['ks_test'] = {
            'statistic': stat,
            'p_value': p_value,
            'is_normal': p_value > 0.05
        }
        
        # Anderson-Darling test
        result = stats.anderson(data)
        results['anderson'] = {
            'statistic': result.statistic,
            'critical_values': result.critical_values,
            'significance_levels': result.significance_level
        }
        
        return results
    
    @staticmethod
    def variance_tests(group1, group2):
        """등분산성 검정"""
        # Levene's test
        stat, p_value = stats.levene(group1, group2)
        
        return {
            'levene': {
                'statistic': stat,
                'p_value': p_value,
                'equal_variance': p_value > 0.05
            }
        }
    
    @staticmethod
    def anova_analysis(groups, labels):
        """ANOVA 분석"""
        # One-way ANOVA
        f_stat, p_value = stats.f_oneway(*groups)
        
        # Post-hoc test (Tukey HSD)
        data_combined = np.concatenate(groups)
        labels_combined = np.concatenate([
            [label] * len(group) 
            for label, group in zip(labels, groups)
        ])
        
        tukey_result = pairwise_tukeyhsd(
            data_combined, 
            labels_combined, 
            alpha=0.05
        )
        
        return {
            'anova': {
                'f_statistic': f_stat,
                'p_value': p_value,
                'significant': p_value < 0.05
            },
            'post_hoc': str(tukey_result)
        }
```

#### 회귀 분석
```python
class RegressionAnalysis:
    def __init__(self, X, y):
        self.X = X
        self.y = y
        self.model = None
        self.results = None
        
    def linear_regression(self):
        """선형 회귀 분석"""
        # 상수항 추가
        X_with_const = sm.add_constant(self.X)
        
        # 모델 적합
        self.model = sm.OLS(self.y, X_with_const)
        self.results = self.model.fit()
        
        # 결과 요약
        summary = {
            'r_squared': self.results.rsquared,
            'adj_r_squared': self.results.rsquared_adj,
            'f_statistic': self.results.fvalue,
            'f_pvalue': self.results.f_pvalue,
            'coefficients': dict(zip(
                self.X.columns, 
                self.results.params[1:]
            )),
            'p_values': dict(zip(
                self.X.columns,
                self.results.pvalues[1:]
            )),
            'confidence_intervals': self.results.conf_int()[1:].values.tolist()
        }
        
        return summary
    
    def check_assumptions(self):
        """회귀 가정 검증"""
        residuals = self.results.resid
        fitted = self.results.fittedvalues
        
        # 1. 선형성 검정
        linearity_test = stats.pearsonr(fitted, self.y)[1] < 0.05
        
        # 2. 정규성 검정
        _, normality_pvalue = stats.jarque_bera(residuals)
        
        # 3. 등분산성 검정 (Breusch-Pagan test)
        bp_test = sm.stats.diagnostic.het_breuschpagan(
            residuals, self.results.model.exog
        )
        
        # 4. 자기상관 검정 (Durbin-Watson)
        dw_stat = sm.stats.stattools.durbin_watson(residuals)
        
        # 5. 다중공선성 (VIF)
        from statsmodels.stats.outliers_influence import variance_inflation_factor
        
        vif_data = pd.DataFrame()
        vif_data["Variable"] = self.X.columns
        vif_data["VIF"] = [
            variance_inflation_factor(self.X.values, i) 
            for i in range(self.X.shape[1])
        ]
        
        return {
            'linearity': linearity_test,
            'normality': normality_pvalue > 0.05,
            'homoscedasticity': bp_test[1] > 0.05,
            'autocorrelation': 1.5 < dw_stat < 2.5,
            'multicollinearity': vif_data.to_dict()
        }
```

### 시계열 분석

#### 시계열 분해 및 예측
```python
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller, kpss
from statsmodels.tsa.arima.model import ARIMA
from prophet import Prophet

class TimeSeriesAnalysis:
    def __init__(self, ts_data, date_col, value_col):
        self.data = ts_data.set_index(date_col)[value_col].sort_index()
        self.decomposition = None
        
    def test_stationarity(self):
        """정상성 검정"""
        # ADF Test
        adf_result = adfuller(self.data, autolag='AIC')
        
        # KPSS Test
        kpss_result = kpss(self.data, regression='c', nlags='auto')
        
        return {
            'adf': {
                'statistic': adf_result[0],
                'p_value': adf_result[1],
                'is_stationary': adf_result[1] < 0.05
            },
            'kpss': {
                'statistic': kpss_result[0],
                'p_value': kpss_result[1],
                'is_stationary': kpss_result[1] > 0.05
            }
        }
    
    def decompose_series(self, model='additive', period=None):
        """시계열 분해"""
        self.decomposition = seasonal_decompose(
            self.data, 
            model=model, 
            period=period,
            extrapolate_trend='freq'
        )
        
        return {
            'trend': self.decomposition.trend,
            'seasonal': self.decomposition.seasonal,
            'residual': self.decomposition.resid
        }
    
    def fit_arima(self, order=(1,1,1), seasonal_order=(0,0,0,0)):
        """ARIMA 모델 적합"""
        model = ARIMA(self.data, order=order, seasonal_order=seasonal_order)
        fitted_model = model.fit()
        
        # 예측
        forecast = fitted_model.forecast(steps=30)
        
        return {
            'model': fitted_model,
            'aic': fitted_model.aic,
            'bic': fitted_model.bic,
            'forecast': forecast,
            'summary': fitted_model.summary()
        }
    
    def prophet_forecast(self, periods=30):
        """Prophet 예측"""
        # 데이터 준비
        prophet_data = pd.DataFrame({
            'ds': self.data.index,
            'y': self.data.values
        })
        
        # 모델 생성 및 학습
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            changepoint_prior_scale=0.05
        )
        
        model.fit(prophet_data)
        
        # 예측
        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)
        
        return {
            'model': model,
            'forecast': forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']],
            'components': model.plot_components(forecast)
        }
```

### 머신러닝 기법

#### 특성 공학
```python
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.feature_selection import SelectKBest, f_classif, RFE
from sklearn.decomposition import PCA

class FeatureEngineering:
    def __init__(self, X, y):
        self.X = X
        self.y = y
        
    def create_polynomial_features(self, degree=2):
        """다항 특성 생성"""
        poly = PolynomialFeatures(degree=degree, include_bias=False)
        X_poly = poly.fit_transform(self.X)
        
        feature_names = poly.get_feature_names_out(self.X.columns)
        
        return pd.DataFrame(X_poly, columns=feature_names, index=self.X.index)
    
    def create_interaction_features(self):
        """상호작용 특성 생성"""
        interactions = pd.DataFrame(index=self.X.index)
        
        for i, col1 in enumerate(self.X.columns):
            for col2 in self.X.columns[i+1:]:
                # 곱셈 상호작용
                interactions[f'{col1}_x_{col2}'] = self.X[col1] * self.X[col2]
                
                # 나눗셈 상호작용 (0 방지)
                denominator = self.X[col2].replace(0, np.nan)
                interactions[f'{col1}_div_{col2}'] = self.X[col1] / denominator
                
        return interactions
    
    def create_lag_features(self, n_lags=3):
        """시차 특성 생성"""
        lag_features = pd.DataFrame(index=self.X.index)
        
        for col in self.X.columns:
            for lag in range(1, n_lags + 1):
                lag_features[f'{col}_lag{lag}'] = self.X[col].shift(lag)
                
        return lag_features
    
    def select_features(self, method='univariate', n_features=10):
        """특성 선택"""
        if method == 'univariate':
            # Univariate selection
            selector = SelectKBest(score_func=f_classif, k=n_features)
            selector.fit(self.X, self.y)
            
            selected_features = self.X.columns[selector.get_support()]
            scores = pd.DataFrame({
                'feature': self.X.columns,
                'score': selector.scores_
            }).sort_values('score', ascending=False)
            
        elif method == 'rfe':
            # Recursive Feature Elimination
            from sklearn.ensemble import RandomForestClassifier
            
            estimator = RandomForestClassifier(n_estimators=100, random_state=42)
            selector = RFE(estimator, n_features_to_select=n_features)
            selector.fit(self.X, self.y)
            
            selected_features = self.X.columns[selector.support_]
            scores = pd.DataFrame({
                'feature': self.X.columns,
                'ranking': selector.ranking_
            }).sort_values('ranking')
            
        return selected_features, scores
    
    def dimensionality_reduction(self, n_components=0.95):
        """차원 축소"""
        # 표준화
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(self.X)
        
        # PCA
        pca = PCA(n_components=n_components)
        X_pca = pca.fit_transform(X_scaled)
        
        # 주성분 기여도
        component_importance = pd.DataFrame({
            'component': [f'PC{i+1}' for i in range(len(pca.components_))],
            'explained_variance_ratio': pca.explained_variance_ratio_,
            'cumulative_variance_ratio': np.cumsum(pca.explained_variance_ratio_)
        })
        
        # 특성 중요도
        feature_importance = pd.DataFrame(
            pca.components_.T,
            columns=[f'PC{i+1}' for i in range(len(pca.components_))],
            index=self.X.columns
        )
        
        return {
            'transformed_data': X_pca,
            'component_importance': component_importance,
            'feature_importance': feature_importance,
            'n_components': pca.n_components_
        }
```

#### 클러스터링 분석
```python
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import silhouette_score, calinski_harabasz_score

class ClusteringAnalysis:
    def __init__(self, X):
        self.X = X
        self.scaler = StandardScaler()
        self.X_scaled = self.scaler.fit_transform(X)
        
    def find_optimal_clusters(self, max_k=10):
        """최적 클러스터 수 찾기"""
        metrics = {
            'k': [],
            'inertia': [],
            'silhouette': [],
            'calinski_harabasz': []
        }
        
        for k in range(2, max_k + 1):
            kmeans = KMeans(n_clusters=k, random_state=42)
            labels = kmeans.fit_predict(self.X_scaled)
            
            metrics['k'].append(k)
            metrics['inertia'].append(kmeans.inertia_)
            metrics['silhouette'].append(silhouette_score(self.X_scaled, labels))
            metrics['calinski_harabasz'].append(
                calinski_harabasz_score(self.X_scaled, labels)
            )
        
        # Elbow method
        differences = np.diff(metrics['inertia'])
        elbow_point = np.argmax(differences[1:] - differences[:-1]) + 2
        
        return pd.DataFrame(metrics), elbow_point
    
    def perform_clustering(self, method='kmeans', **params):
        """클러스터링 수행"""
        if method == 'kmeans':
            model = KMeans(**params)
        elif method == 'dbscan':
            model = DBSCAN(**params)
        elif method == 'hierarchical':
            model = AgglomerativeClustering(**params)
        
        labels = model.fit_predict(self.X_scaled)
        
        # 클러스터 프로파일
        cluster_profiles = []
        for cluster in np.unique(labels):
            if cluster != -1:  # DBSCAN의 noise points 제외
                cluster_mask = labels == cluster
                profile = {
                    'cluster': cluster,
                    'size': np.sum(cluster_mask),
                    'percentage': np.sum(cluster_mask) / len(labels) * 100
                }
                
                # 각 특성의 평균값
                for col in self.X.columns:
                    profile[f'{col}_mean'] = self.X.loc[cluster_mask, col].mean()
                    profile[f'{col}_std'] = self.X.loc[cluster_mask, col].std()
                
                cluster_profiles.append(profile)
        
        return {
            'labels': labels,
            'model': model,
            'profiles': pd.DataFrame(cluster_profiles),
            'silhouette_score': silhouette_score(self.X_scaled, labels) 
                              if len(np.unique(labels)) > 1 else None
        }
```

### 데이터 시각화 고급 기법

#### 고급 시각화 패턴
```python
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.patches import Rectangle
import matplotlib.patches as mpatches

class AdvancedVisualization:
    def __init__(self, style='seaborn'):
        plt.style.use(style)
        self.colors = sns.color_palette('husl', 10)
        
    def create_waterfall_chart(self, categories, values, title="Waterfall Chart"):
        """워터폴 차트"""
        fig, ax = plt.subplots(figsize=(12, 8))
        
        # 누적 계산
        cumulative = np.cumsum(values)
        cumulative = np.concatenate([[0], cumulative])
        
        # 막대 그리기
        for i, (cat, val) in enumerate(zip(categories, values)):
            if val >= 0:
                color = 'green'
                bottom = cumulative[i]
            else:
                color = 'red'
                bottom = cumulative[i+1]
                
            ax.bar(i, abs(val), bottom=bottom, color=color, 
                  edgecolor='black', linewidth=1)
            
            # 값 표시
            ax.text(i, bottom + abs(val)/2, f'{val:,.0f}',
                   ha='center', va='center', fontweight='bold')
        
        # 연결선
        for i in range(len(categories)):
            if i < len(categories) - 1:
                ax.plot([i+0.4, i+0.6], [cumulative[i+1], cumulative[i+1]], 
                       'k--', alpha=0.5)
        
        ax.set_xticks(range(len(categories)))
        ax.set_xticklabels(categories, rotation=45, ha='right')
        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_ylabel('Value', fontsize=14)
        
        # 그리드
        ax.yaxis.grid(True, alpha=0.3)
        ax.set_axisbelow(True)
        
        plt.tight_layout()
        return fig
    
    def create_bullet_chart(self, value, target, ranges, title=""):
        """불릿 차트"""
        fig, ax = plt.subplots(figsize=(8, 3))
        
        # 범위 그리기
        colors = ['#d3d3d3', '#a9a9a9', '#808080']
        for i, (start, end) in enumerate(ranges):
            ax.barh(0, end - start, left=start, height=1, 
                   color=colors[i], alpha=0.5)
        
        # 실제 값
        ax.barh(0, value, height=0.5, color='black')
        
        # 목표 값
        ax.plot([target, target], [-0.6, 0.6], 'r-', linewidth=3)
        
        ax.set_xlim(0, max(ranges[-1][1], value, target) * 1.1)
        ax.set_ylim(-1, 1)
        ax.set_yticks([])
        ax.set_title(title, fontsize=14, fontweight='bold')
        
        # 레이블
        ax.text(value/2, 0, f'{value:,.0f}', 
               ha='center', va='center', color='white', fontweight='bold')
        ax.text(target, -0.8, f'Target: {target:,.0f}', 
               ha='center', fontsize=10)
        
        return fig
    
    def create_sankey_diagram(self, source, target, value, labels):
        """생키 다이어그램"""
        import plotly.graph_objects as go
        
        # 노드 인덱스 매핑
        all_nodes = list(set(source + target))
        node_indices = {node: i for i, node in enumerate(all_nodes)}
        
        source_indices = [node_indices[s] for s in source]
        target_indices = [node_indices[t] for t in target]
        
        fig = go.Figure(data=[go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=all_nodes,
                color="blue"
            ),
            link=dict(
                source=source_indices,
                target=target_indices,
                value=value,
                color="rgba(0,0,255,0.4)"
            )
        )])
        
        fig.update_layout(
            title_text="Sankey Diagram",
            font_size=10,
            height=600
        )
        
        return fig
    
    def create_radar_chart(self, categories, values_dict, title="Radar Chart"):
        """레이더 차트 (여러 그룹 비교)"""
        angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
        angles += angles[:1]
        
        fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
        
        for label, values in values_dict.items():
            values = values.tolist()
            values += values[:1]
            ax.plot(angles, values, 'o-', linewidth=2, label=label)
            ax.fill(angles, values, alpha=0.25)
        
        ax.set_theta_offset(np.pi / 2)
        ax.set_theta_direction(-1)
        ax.set_thetagrids(np.degrees(angles[:-1]), categories)
        
        ax.set_ylim(0, max([max(v) for v in values_dict.values()]) * 1.1)
        ax.set_title(title, fontsize=16, fontweight='bold', pad=20)
        ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
        
        return fig
```

### 리포트 자동화

#### 자동 리포트 생성 시스템
```python
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import markdown
from weasyprint import HTML, CSS

class AutomatedReportGenerator:
    def __init__(self, template_engine='jinja2'):
        self.template_engine = template_engine
        self.sections = []
        
    def add_section(self, title, content, section_type='text'):
        """섹션 추가"""
        self.sections.append({
            'title': title,
            'content': content,
            'type': section_type,
            'timestamp': datetime.now()
        })
    
    def generate_pdf_report(self, filename='report.pdf'):
        """PDF 리포트 생성"""
        with PdfPages(filename) as pdf:
            # 표지 페이지
            self._create_cover_page(pdf)
            
            # 목차
            self._create_table_of_contents(pdf)
            
            # 섹션별 내용
            for i, section in enumerate(self.sections):
                if section['type'] == 'text':
                    self._add_text_page(pdf, section)
                elif section['type'] == 'chart':
                    self._add_chart_page(pdf, section)
                elif section['type'] == 'table':
                    self._add_table_page(pdf, section)
            
            # 메타데이터
            d = pdf.infodict()
            d['Title'] = 'Automated Data Analysis Report'
            d['Author'] = 'Data Analysis System'
            d['Subject'] = 'Data Analysis'
            d['Keywords'] = 'Data, Analysis, Report'
            d['CreationDate'] = datetime.now()
    
    def _create_cover_page(self, pdf):
        """표지 페이지 생성"""
        fig = plt.figure(figsize=(8.5, 11))
        fig.text(0.5, 0.6, 'Data Analysis Report', 
                ha='center', va='center', fontsize=24, fontweight='bold')
        fig.text(0.5, 0.5, f'Generated on {datetime.now().strftime("%Y-%m-%d")}',
                ha='center', va='center', fontsize=16)
        fig.text(0.5, 0.2, 'Automated Report Generation System',
                ha='center', va='center', fontsize=12, style='italic')
        pdf.savefig(fig, bbox_inches='tight')
        plt.close()
    
    def generate_html_report(self, filename='report.html'):
        """HTML 리포트 생성"""
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Data Analysis Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                h1 {{ color: #333; border-bottom: 2px solid #333; }}
                h2 {{ color: #666; }}
                .chart {{ margin: 20px 0; text-align: center; }}
                .table {{ margin: 20px 0; }}
                table {{ border-collapse: collapse; width: 100%; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; font-weight: bold; }}
                .summary-box {{ 
                    background-color: #f0f0f0; 
                    padding: 15px; 
                    border-radius: 5px; 
                    margin: 20px 0;
                }}
                .metric {{ 
                    display: inline-block; 
                    margin: 10px 20px; 
                    text-align: center;
                }}
                .metric-value {{ 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #2c3e50;
                }}
                .metric-label {{ 
                    font-size: 14px; 
                    color: #7f8c8d;
                }}
            </style>
        </head>
        <body>
            <h1>Data Analysis Report</h1>
            <p>Generated on: {date}</p>
            
            {content}
        </body>
        </html>
        """
        
        content = self._generate_html_content()
        html = html_template.format(
            date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            content=content
        )
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
    
    def _generate_html_content(self):
        """HTML 콘텐츠 생성"""
        content_parts = []
        
        for section in self.sections:
            if section['type'] == 'text':
                content_parts.append(f"<h2>{section['title']}</h2>")
                content_parts.append(f"<p>{section['content']}</p>")
                
            elif section['type'] == 'metrics':
                content_parts.append(f"<h2>{section['title']}</h2>")
                content_parts.append('<div class="summary-box">')
                
                for metric, value in section['content'].items():
                    content_parts.append(f'''
                    <div class="metric">
                        <div class="metric-value">{value}</div>
                        <div class="metric-label">{metric}</div>
                    </div>
                    ''')
                    
                content_parts.append('</div>')
                
            elif section['type'] == 'table':
                content_parts.append(f"<h2>{section['title']}</h2>")
                content_parts.append('<div class="table">')
                content_parts.append(section['content'].to_html(index=False))
                content_parts.append('</div>')
        
        return '\n'.join(content_parts)
```

### 비즈니스 인텔리전스

#### KPI 대시보드
```python
class KPIDashboard:
    def __init__(self, data):
        self.data = data
        self.kpis = {}
        
    def calculate_kpis(self):
        """주요 KPI 계산"""
        self.kpis = {
            'revenue': {
                'current': self.data['revenue'].sum(),
                'previous': self.data['revenue_prev'].sum(),
                'growth': self._calculate_growth('revenue', 'revenue_prev'),
                'target': self.data['revenue_target'].sum()
            },
            'customers': {
                'total': self.data['customer_id'].nunique(),
                'new': self.data[self.data['is_new_customer']]['customer_id'].nunique(),
                'retention_rate': self._calculate_retention_rate(),
                'churn_rate': self._calculate_churn_rate()
            },
            'operations': {
                'avg_order_value': self.data['revenue'].mean(),
                'conversion_rate': self._calculate_conversion_rate(),
                'fulfillment_time': self.data['fulfillment_hours'].mean()
            }
        }
        
    def _calculate_growth(self, current_col, previous_col):
        """성장률 계산"""
        current = self.data[current_col].sum()
        previous = self.data[previous_col].sum()
        
        if previous == 0:
            return float('inf')
        
        return ((current - previous) / previous) * 100
    
    def create_scorecard(self):
        """스코어카드 생성"""
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        axes = axes.flatten()
        
        # Revenue KPI
        self._create_kpi_widget(
            axes[0], 
            'Revenue', 
            self.kpis['revenue']['current'],
            self.kpis['revenue']['growth'],
            self.kpis['revenue']['target']
        )
        
        # Customer KPIs
        self._create_kpi_widget(
            axes[1],
            'Total Customers',
            self.kpis['customers']['total'],
            self.kpis['customers']['new'],
            None
        )
        
        # Retention Rate
        self._create_gauge_chart(
            axes[2],
            'Retention Rate',
            self.kpis['customers']['retention_rate'],
            [0, 100]
        )
        
        # Continue with other KPIs...
        
        plt.tight_layout()
        return fig
    
    def _create_kpi_widget(self, ax, title, value, change, target=None):
        """KPI 위젯 생성"""
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis('off')
        
        # 제목
        ax.text(0.5, 0.9, title, ha='center', fontsize=14, fontweight='bold')
        
        # 값
        ax.text(0.5, 0.6, f'{value:,.0f}', ha='center', fontsize=24, fontweight='bold')
        
        # 변화율
        color = 'green' if change >= 0 else 'red'
        arrow = '▲' if change >= 0 else '▼'
        ax.text(0.5, 0.4, f'{arrow} {abs(change):.1f}%', 
               ha='center', fontsize=16, color=color)
        
        # 목표
        if target:
            progress = (value / target) * 100
            ax.text(0.5, 0.2, f'Target: {progress:.1f}%', 
                   ha='center', fontsize=12, color='gray')
```