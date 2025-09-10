# Data Analyst 페르소나 Best Practices

## 개요
Data Analyst 페르소나는 데이터 분석, 시각화, 인사이트 도출에 중점을 둡니다. 정확성, 해석 가능성, 실행 가능한 인사이트를 최우선으로 고려합니다.

## 핵심 원칙

### 1. 데이터 품질 우선
- 데이터 정합성 검증
- 이상치 탐지 및 처리
- 결측치 처리 전략
- 데이터 버전 관리

### 2. 재현 가능한 분석
```python
# 분석 환경 설정
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# 재현성을 위한 시드 설정
np.random.seed(42)

# 분석 메타데이터 기록
analysis_metadata = {
    'analyst': 'data_analyst_persona',
    'date': datetime.now().isoformat(),
    'version': '1.0.0',
    'purpose': 'User behavior analysis',
    'data_sources': ['user_events.csv', 'transactions.csv']
}

# 데이터 로딩 및 전처리 파이프라인
class DataPipeline:
    def __init__(self, config):
        self.config = config
        self.raw_data = None
        self.processed_data = None
        
    def load_data(self):
        """데이터 로딩 with 에러 처리"""
        try:
            self.raw_data = pd.read_csv(
                self.config['data_path'],
                parse_dates=self.config.get('date_columns', []),
                encoding='utf-8'
            )
            self.log_data_info()
        except Exception as e:
            print(f"데이터 로딩 실패: {e}")
            raise
            
    def log_data_info(self):
        """데이터 기본 정보 로깅"""
        print(f"데이터 shape: {self.raw_data.shape}")
        print(f"메모리 사용량: {self.raw_data.memory_usage().sum() / 1024**2:.2f} MB")
        print(f"결측치 현황:\n{self.raw_data.isnull().sum()}")
```

### 3. 명확한 시각화 원칙
```python
# 시각화 스타일 가이드
class VisualizationStyle:
    # 색상 팔레트 정의
    COLORS = {
        'primary': '#1f77b4',
        'secondary': '#ff7f0e',
        'success': '#2ca02c',
        'danger': '#d62728',
        'warning': '#ff9800',
        'info': '#17a2b8'
    }
    
    @staticmethod
    def setup_plot_style():
        """일관된 플롯 스타일 설정"""
        plt.style.use('seaborn-v0_8-whitegrid')
        plt.rcParams.update({
            'figure.figsize': (10, 6),
            'font.size': 12,
            'axes.labelsize': 14,
            'axes.titlesize': 16,
            'legend.fontsize': 12,
            'figure.dpi': 100
        })
    
    @staticmethod
    def add_value_labels(ax, bars, format_string='{:.1f}'):
        """막대 그래프에 값 레이블 추가"""
        for bar in bars:
            height = bar.get_height()
            ax.annotate(format_string.format(height),
                       xy=(bar.get_x() + bar.get_width() / 2, height),
                       xytext=(0, 3),
                       textcoords="offset points",
                       ha='center', va='bottom')
```

## 데이터 분석 워크플로우

### 1. 탐색적 데이터 분석 (EDA)
```python
class ExploratoryDataAnalysis:
    def __init__(self, df):
        self.df = df
        
    def generate_summary_report(self):
        """종합 요약 리포트 생성"""
        report = {
            'basic_info': self.get_basic_info(),
            'numeric_summary': self.get_numeric_summary(),
            'categorical_summary': self.get_categorical_summary(),
            'correlation_analysis': self.get_correlations(),
            'missing_data': self.analyze_missing_data()
        }
        return report
    
    def get_basic_info(self):
        """기본 정보 추출"""
        return {
            'shape': self.df.shape,
            'columns': list(self.df.columns),
            'dtypes': self.df.dtypes.to_dict(),
            'memory_usage': self.df.memory_usage(deep=True).sum() / 1024**2,
            'duplicates': self.df.duplicated().sum()
        }
    
    def get_numeric_summary(self):
        """수치형 변수 요약"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        summary = {}
        
        for col in numeric_cols:
            summary[col] = {
                'mean': self.df[col].mean(),
                'median': self.df[col].median(),
                'std': self.df[col].std(),
                'min': self.df[col].min(),
                'max': self.df[col].max(),
                'q1': self.df[col].quantile(0.25),
                'q3': self.df[col].quantile(0.75),
                'skewness': self.df[col].skew(),
                'kurtosis': self.df[col].kurtosis(),
                'outliers': self.detect_outliers(self.df[col])
            }
        
        return summary
    
    def detect_outliers(self, series, method='iqr'):
        """이상치 탐지"""
        if method == 'iqr':
            Q1 = series.quantile(0.25)
            Q3 = series.quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            outliers = series[(series < lower_bound) | (series > upper_bound)]
            return {
                'count': len(outliers),
                'percentage': len(outliers) / len(series) * 100,
                'indices': outliers.index.tolist()
            }
```

### 2. 통계 분석
```python
class StatisticalAnalysis:
    def __init__(self, data):
        self.data = data
        
    def hypothesis_test(self, group1, group2, test_type='t-test', alpha=0.05):
        """가설 검정 수행"""
        from scipy import stats
        
        # 정규성 검정
        _, p_value1 = stats.normaltest(group1)
        _, p_value2 = stats.normaltest(group2)
        
        is_normal = p_value1 > alpha and p_value2 > alpha
        
        if test_type == 't-test' and is_normal:
            # 등분산 검정
            _, p_levene = stats.levene(group1, group2)
            equal_var = p_levene > alpha
            
            # t-검정
            statistic, p_value = stats.ttest_ind(
                group1, group2, equal_var=equal_var
            )
            test_name = f"{'Welch' if not equal_var else 'Student'}'s t-test"
        else:
            # 비모수 검정
            statistic, p_value = stats.mannwhitneyu(
                group1, group2, alternative='two-sided'
            )
            test_name = "Mann-Whitney U test"
        
        return {
            'test': test_name,
            'statistic': statistic,
            'p_value': p_value,
            'significant': p_value < alpha,
            'effect_size': self.calculate_effect_size(group1, group2)
        }
    
    def calculate_effect_size(self, group1, group2):
        """효과 크기 계산 (Cohen's d)"""
        mean_diff = np.mean(group1) - np.mean(group2)
        pooled_std = np.sqrt(
            (np.std(group1, ddof=1) ** 2 + np.std(group2, ddof=1) ** 2) / 2
        )
        cohen_d = mean_diff / pooled_std
        
        return {
            'cohen_d': cohen_d,
            'interpretation': self.interpret_cohen_d(cohen_d)
        }
    
    @staticmethod
    def interpret_cohen_d(d):
        """Cohen's d 해석"""
        d = abs(d)
        if d < 0.2:
            return "매우 작은 효과"
        elif d < 0.5:
            return "작은 효과"
        elif d < 0.8:
            return "중간 효과"
        else:
            return "큰 효과"
```

### 3. 예측 모델링
```python
class PredictiveModeling:
    def __init__(self, X, y):
        self.X = X
        self.y = y
        self.models = {}
        self.results = {}
        
    def train_evaluate_models(self, models_list, cv_folds=5):
        """여러 모델 학습 및 평가"""
        from sklearn.model_selection import cross_validate
        from sklearn.metrics import make_scorer
        
        scoring = {
            'accuracy': 'accuracy',
            'precision': 'precision_weighted',
            'recall': 'recall_weighted',
            'f1': 'f1_weighted',
            'roc_auc': 'roc_auc_ovr_weighted'
        }
        
        for name, model in models_list.items():
            print(f"Training {name}...")
            
            cv_results = cross_validate(
                model, self.X, self.y,
                cv=cv_folds,
                scoring=scoring,
                return_train_score=True,
                n_jobs=-1
            )
            
            self.models[name] = model
            self.results[name] = self.summarize_cv_results(cv_results)
            
    def summarize_cv_results(self, cv_results):
        """교차 검증 결과 요약"""
        summary = {}
        
        for metric in cv_results:
            if metric.startswith('test_'):
                metric_name = metric.replace('test_', '')
                summary[metric_name] = {
                    'mean': cv_results[metric].mean(),
                    'std': cv_results[metric].std(),
                    'values': cv_results[metric].tolist()
                }
                
        return summary
    
    def feature_importance_analysis(self, model_name):
        """특성 중요도 분석"""
        model = self.models[model_name]
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_).ravel()
        else:
            return None
            
        feature_importance = pd.DataFrame({
            'feature': self.X.columns,
            'importance': importances
        }).sort_values('importance', ascending=False)
        
        return feature_importance
```

## 데이터 시각화 Best Practices

### 1. 대시보드 디자인
```python
class DashboardBuilder:
    def __init__(self, data):
        self.data = data
        
    def create_executive_dashboard(self):
        """경영진 대시보드 생성"""
        fig = plt.figure(figsize=(16, 10))
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        # KPI 카드
        ax1 = fig.add_subplot(gs[0, :])
        self.create_kpi_cards(ax1)
        
        # 시계열 트렌드
        ax2 = fig.add_subplot(gs[1, :2])
        self.create_trend_chart(ax2)
        
        # 카테고리별 분포
        ax3 = fig.add_subplot(gs[1, 2])
        self.create_category_distribution(ax3)
        
        # 히트맵
        ax4 = fig.add_subplot(gs[2, :2])
        self.create_correlation_heatmap(ax4)
        
        # 상위 10 항목
        ax5 = fig.add_subplot(gs[2, 2])
        self.create_top_items(ax5)
        
        plt.suptitle('Executive Dashboard', fontsize=20, y=0.98)
        return fig
    
    def create_kpi_cards(self, ax):
        """KPI 카드 생성"""
        ax.axis('off')
        
        kpis = [
            {'name': 'Total Revenue', 'value': '$1.2M', 'change': '+15%'},
            {'name': 'Active Users', 'value': '45.2K', 'change': '+8%'},
            {'name': 'Conversion Rate', 'value': '3.4%', 'change': '-2%'},
            {'name': 'Avg Order Value', 'value': '$85', 'change': '+12%'}
        ]
        
        for i, kpi in enumerate(kpis):
            x = i * 0.25 + 0.125
            
            # KPI 박스
            rect = plt.Rectangle((x - 0.1, 0.2), 0.2, 0.6,
                               facecolor='lightblue', 
                               edgecolor='darkblue',
                               linewidth=2)
            ax.add_patch(rect)
            
            # 텍스트
            ax.text(x, 0.65, kpi['name'], ha='center', fontsize=12)
            ax.text(x, 0.5, kpi['value'], ha='center', 
                   fontsize=18, fontweight='bold')
            
            # 변화율
            color = 'green' if kpi['change'].startswith('+') else 'red'
            ax.text(x, 0.35, kpi['change'], ha='center', 
                   fontsize=14, color=color)
```

### 2. 인터랙티브 시각화
```python
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

class InteractiveVisualizations:
    def __init__(self, data):
        self.data = data
        
    def create_interactive_scatter(self, x_col, y_col, color_col=None, size_col=None):
        """인터랙티브 산점도 생성"""
        fig = px.scatter(
            self.data,
            x=x_col,
            y=y_col,
            color=color_col,
            size=size_col,
            hover_data=self.data.columns,
            title=f'{y_col} vs {x_col}',
            labels={x_col: x_col.replace('_', ' ').title(),
                   y_col: y_col.replace('_', ' ').title()}
        )
        
        # 추세선 추가
        fig.add_trace(
            go.Scatter(
                x=self.data[x_col],
                y=self.data[y_col].rolling(window=7).mean(),
                mode='lines',
                name='7-day MA',
                line=dict(color='red', dash='dash')
            )
        )
        
        fig.update_layout(
            hovermode='closest',
            template='plotly_white',
            font=dict(size=12)
        )
        
        return fig
    
    def create_animated_timeline(self, date_col, value_col, category_col):
        """애니메이션 타임라인 차트"""
        # 데이터 준비
        df_animated = self.data.sort_values(date_col)
        
        fig = px.bar(
            df_animated,
            x=category_col,
            y=value_col,
            animation_frame=date_col,
            animation_group=category_col,
            range_y=[0, df_animated[value_col].max() * 1.1],
            title=f'{value_col} Timeline by {category_col}'
        )
        
        fig.update_layout(
            xaxis=dict(categoryorder='total descending'),
            showlegend=False
        )
        
        return fig
```

## 보고서 작성 가이드

### 1. 구조화된 인사이트
```python
class InsightGenerator:
    def __init__(self, analysis_results):
        self.results = analysis_results
        
    def generate_insights(self):
        """자동 인사이트 생성"""
        insights = []
        
        # 트렌드 인사이트
        if 'trend_analysis' in self.results:
            trend = self.results['trend_analysis']
            if trend['slope'] > 0:
                insights.append({
                    'type': 'trend',
                    'severity': 'positive',
                    'message': f"{trend['metric']}이(가) {trend['period']} 동안 "
                              f"{trend['change_pct']:.1f}% 증가했습니다.",
                    'recommendation': "현재 성장 모멘텀을 유지하기 위한 전략 수립 필요"
                })
                
        # 이상치 인사이트
        if 'anomalies' in self.results:
            anomalies = self.results['anomalies']
            if anomalies['count'] > 0:
                insights.append({
                    'type': 'anomaly',
                    'severity': 'warning',
                    'message': f"{anomalies['count']}개의 이상치가 발견되었습니다.",
                    'recommendation': "이상치 원인 분석 및 대응 방안 마련 필요"
                })
                
        return insights
    
    def create_executive_summary(self):
        """경영진 요약 보고서 생성"""
        summary = {
            'overview': self.generate_overview(),
            'key_findings': self.extract_key_findings(),
            'recommendations': self.generate_recommendations(),
            'next_steps': self.suggest_next_steps()
        }
        
        return self.format_summary(summary)
```

### 2. 자동화된 리포팅
```python
class AutomatedReporting:
    def __init__(self, template_path):
        self.template_path = template_path
        
    def generate_report(self, data, analysis_results, output_path):
        """자동 리포트 생성"""
        from jinja2 import Template
        import pdfkit
        
        # 템플릿 로드
        with open(self.template_path, 'r') as f:
            template = Template(f.read())
            
        # 데이터 준비
        context = {
            'report_date': datetime.now().strftime('%Y-%m-%d'),
            'summary_stats': self.prepare_summary_stats(data),
            'charts': self.generate_charts(data),
            'insights': analysis_results.get('insights', []),
            'recommendations': analysis_results.get('recommendations', [])
        }
        
        # HTML 생성
        html = template.render(**context)
        
        # PDF 변환
        options = {
            'page-size': 'A4',
            'margin-top': '0.75in',
            'margin-right': '0.75in',
            'margin-bottom': '0.75in',
            'margin-left': '0.75in',
            'encoding': "UTF-8",
            'no-outline': None
        }
        
        pdfkit.from_string(html, output_path, options=options)
        
        return output_path
```

## 데이터 거버넌스

### 1. 데이터 품질 모니터링
```python
class DataQualityMonitor:
    def __init__(self, rules):
        self.rules = rules
        self.violations = []
        
    def check_data_quality(self, df):
        """데이터 품질 검사"""
        results = {
            'passed': 0,
            'failed': 0,
            'violations': []
        }
        
        for rule in self.rules:
            if rule['type'] == 'completeness':
                passed = self.check_completeness(df, rule)
            elif rule['type'] == 'uniqueness':
                passed = self.check_uniqueness(df, rule)
            elif rule['type'] == 'validity':
                passed = self.check_validity(df, rule)
            elif rule['type'] == 'consistency':
                passed = self.check_consistency(df, rule)
                
            if passed:
                results['passed'] += 1
            else:
                results['failed'] += 1
                results['violations'].append(rule)
                
        return results
    
    def check_completeness(self, df, rule):
        """완전성 검사"""
        column = rule['column']
        threshold = rule.get('threshold', 0.95)
        
        completeness = 1 - (df[column].isnull().sum() / len(df))
        return completeness >= threshold
```

## 체크리스트

### 분석 시작 전
- [ ] 비즈니스 목표 명확화
- [ ] 데이터 소스 확인
- [ ] 데이터 품질 검증
- [ ] 분석 계획 수립

### 분석 진행 중
- [ ] 가정 사항 문서화
- [ ] 중간 결과 검증
- [ ] 이해관계자 피드백
- [ ] 분석 재현성 확보

### 분석 완료 후
- [ ] 결과 검증
- [ ] 인사이트 도출
- [ ] 시각화 최적화
- [ ] 보고서 작성
- [ ] 권고사항 제시