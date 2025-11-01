// Chart.js Configuration and Management
class StudyCharts {
    constructor() {
        this.charts = {};
        this.initializeCharts();
    }

    // Initialize all charts
    initializeCharts() {
        this.createDailyChart();
        this.createCumulativeChart();
        this.createWeeklyChart();
        this.createTrendChart();
    }

    // Get chart color scheme based on theme
    getColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        return {
            primary: isDark ? '#60a5fa' : '#3b82f6',
            secondary: isDark ? '#34d399' : '#10b981',
            tertiary: isDark ? '#fbbf24' : '#f59e0b',
            background: isDark ? '#1e293b' : '#f8fafc',
            text: isDark ? '#f1f5f9' : '#1e293b',
            grid: isDark ? '#475569' : '#e2e8f0'
        };
    }

    // Get default chart options
    getDefaultOptions() {
        const colors = this.getColors();
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: colors.text,
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: colors.text,
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    },
                    grid: {
                        color: colors.grid
                    }
                },
                y: {
                    ticks: {
                        color: colors.text,
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    },
                    grid: {
                        color: colors.grid
                    }
                }
            }
        };
    }

    // Create daily study time chart
    createDailyChart() {
        const ctx = document.getElementById('dailyChart');
        if (!ctx) return;

        const colors = this.getColors();
        
        this.charts.daily = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Study Time (hours)',
                    data: [],
                    backgroundColor: colors.primary + '80',
                    borderColor: colors.primary,
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    title: {
                        display: false
                    }
                },
                scales: {
                    ...this.getDefaultOptions().scales,
                    y: {
                        ...this.getDefaultOptions().scales.y,
                        beginAtZero: true,
                        ticks: {
                            ...this.getDefaultOptions().scales.y.ticks,
                            callback: function(value) {
                                return value.toFixed(1) + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    // Create cumulative progress chart
    createCumulativeChart() {
        const ctx = document.getElementById('cumulativeChart');
        if (!ctx) return;

        const colors = this.getColors();
        
        this.charts.cumulative = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Cumulative Hours',
                    data: [],
                    borderColor: colors.secondary,
                    backgroundColor: colors.secondary + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                scales: {
                    ...this.getDefaultOptions().scales,
                    y: {
                        ...this.getDefaultOptions().scales.y,
                        beginAtZero: true,
                        ticks: {
                            ...this.getDefaultOptions().scales.y.ticks,
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    }
                }
            }
        });
    }

    // Create weekly averages chart
    createWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        const colors = this.getColors();
        
        this.charts.weekly = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        colors.primary,
                        colors.secondary,
                        colors.tertiary,
                        colors.primary + '80',
                        colors.secondary + '80'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: colors.text,
                            font: {
                                family: 'Inter',
                                size: 12
                            },
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    // Create trend chart
    createTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const colors = this.getColors();
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Study Hours',
                    data: [],
                    borderColor: colors.primary,
                    backgroundColor: colors.primary,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: colors.primary,
                    pointBorderColor: colors.primary,
                    pointBorderWidth: 0,
                    fill: false,
                    tension: 0.3
                }]
            },
            options: {
                ...this.getDefaultOptions(),
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    ...this.getDefaultOptions().scales,
                    y: {
                        ...this.getDefaultOptions().scales.y,
                        beginAtZero: true,
                        ticks: {
                            ...this.getDefaultOptions().scales.y.ticks,
                            callback: function(value) {
                                return value + 'h';
                            }
                        }
                    }
                },
                plugins: {
                    ...this.getDefaultOptions().plugins,
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Study Time: ${context.parsed.y}h`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Update daily chart with new data
    updateDailyChart(entries) {
        if (!this.charts.daily) return;

        // Get last 30 days
        const today = new Date();
        const labels = [];
        const data = [];

        // Create array of last 30 days (including today)
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const entry = entries.find(e => e.date === dateString);
            // Convert minutes to hours with decimal precision
            data.push(entry ? (entry.total_minutes / 60) : 0);
        }

        this.charts.daily.data.labels = labels;
        this.charts.daily.data.datasets[0].data = data;
        this.charts.daily.update();
    }

    // Update cumulative chart
    updateCumulativeChart(entries) {
        if (!this.charts.cumulative) return;

        // Sort entries by date
        const sortedEntries = entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const labels = [];
        const data = [];
        let cumulative = 0;

        sortedEntries.forEach(entry => {
            const date = new Date(entry.date);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            cumulative += entry.total_minutes / 60; // Convert to hours
            data.push(Math.round(cumulative * 100) / 100); // Round to 2 decimal places for precision
        });

        this.charts.cumulative.data.labels = labels;
        this.charts.cumulative.data.datasets[0].data = data;
        this.charts.cumulative.update();
    }

    // Update weekly chart
    updateWeeklyChart(entries) {
        if (!this.charts.weekly) return;

        // Group entries by week (Monday as start of week)
        const weeks = {};

        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            // Calculate Monday of the week (ISO week)
            const monday = new Date(entryDate);
            const dayOfWeek = entryDate.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so we need 6 days back
            monday.setDate(entryDate.getDate() - daysToMonday);
            
            const weekKey = monday.toISOString().split('T')[0];
            
            if (!weeks[weekKey]) {
                weeks[weekKey] = {
                    totalMinutes: 0,
                    weekStart: monday
                };
            }
            
            weeks[weekKey].totalMinutes += entry.total_minutes;
        });

        // Get last 5 weeks
        const weekData = Object.values(weeks)
            .sort((a, b) => b.weekStart - a.weekStart)
            .slice(0, 5)
            .reverse();

        const labels = weekData.map(week => {
            const weekEnd = new Date(week.weekStart);
            weekEnd.setDate(week.weekStart.getDate() + 6);
            return `${week.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        });

        const data = weekData.map(week => Math.round(week.totalMinutes / 60 * 10) / 10); // Convert to hours

        this.charts.weekly.data.labels = labels;
        this.charts.weekly.data.datasets[0].data = data;
        this.charts.weekly.update();
    }

    // Update trend chart
    updateTrendChart(entries) {
        if (!this.charts.trend) return;

        // Get current month data (from 1st to last day of current month)
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        
        // Get first and last day of current month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0); // 0th day of next month = last day of current month
        
        const labels = [];
        const data = [];

        // Create array for all days in current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateString = date.toISOString().split('T')[0];
            
            // Format label based on month length
            if (lastDay.getDate() <= 15) {
                // Short month - show full date
                labels.push(date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                }));
            } else {
                // Long month - show just day number
                labels.push(day.toString());
            }
            
            const entry = entries.find(e => e.date === dateString);
            // Convert minutes to hours with one decimal precision
            data.push(entry ? Math.round((entry.total_minutes / 60) * 10) / 10 : 0);
        }

        this.charts.trend.data.labels = labels;
        this.charts.trend.data.datasets[0].data = data;
        this.charts.trend.update();
    }

    // Update all charts
    updateAllCharts(entries) {
        this.updateDailyChart(entries);
        this.updateCumulativeChart(entries);
        this.updateWeeklyChart(entries);
        this.updateTrendChart(entries);
    }

    // Update chart colors for theme changes
    updateTheme() {
        const colors = this.getColors();
        
        Object.values(this.charts).forEach(chart => {
            if (!chart) return;
            
            // Update scales colors
            if (chart.options.scales) {
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = colors.text;
                    chart.options.scales.x.grid.color = colors.grid;
                }
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = colors.text;
                    chart.options.scales.y.grid.color = colors.grid;
                }
            }
            
            // Update legend colors
            if (chart.options.plugins && chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = colors.text;
            }
            
            chart.update();
        });
        
        // Update dataset colors
        if (this.charts.daily) {
            this.charts.daily.data.datasets[0].backgroundColor = colors.primary + '80';
            this.charts.daily.data.datasets[0].borderColor = colors.primary;
            this.charts.daily.update();
        }
        
        if (this.charts.cumulative) {
            this.charts.cumulative.data.datasets[0].borderColor = colors.secondary;
            this.charts.cumulative.data.datasets[0].backgroundColor = colors.secondary + '20';
            this.charts.cumulative.update();
        }
        
        if (this.charts.weekly) {
            this.charts.weekly.data.datasets[0].backgroundColor = [
                colors.primary,
                colors.secondary,
                colors.tertiary,
                colors.primary + '80',
                colors.secondary + '80'
            ];
            this.charts.weekly.update();
        }
    }

    // Destroy all charts
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }
}

// Initialize charts instance
let studyCharts;

// Make it available globally for non-module scripts
window.StudyCharts = StudyCharts;

export { StudyCharts, studyCharts };