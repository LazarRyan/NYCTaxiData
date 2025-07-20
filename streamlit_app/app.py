import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import sqlalchemy
from sqlalchemy import text
import numpy as np
from datetime import datetime, timedelta
import os
import folium
from folium import plugins
from streamlit_folium import st_folium
import seaborn as sns
import matplotlib.pyplot as plt
import psycopg2
from utils import get_nyc_location_name, create_enhanced_metrics

# Page configuration
st.set_page_config(
    page_title="NYC Taxi Analytics Dashboard",
    page_icon="🚕",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern styling
st.markdown("""
<style>
    .main-header {
        font-size: 3.5rem;
        background: linear-gradient(90deg, #1f77b4, #ff7f0e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: bold;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        text-align: center;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
    }
    .metric-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    .chart-container {
        background: white;
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        margin: 1rem 0;
    }
    .stSelectbox > div > div {
        background: white;
        border-radius: 0.5rem;
    }
    .stSelectbox > div > div > div {
        color: #333 !important;
        font-weight: 500;
    }
    .stDateInput > div > div {
        background: white;
        border-radius: 0.5rem;
    }
    .stDateInput > div > div > div {
        color: #333 !important;
        font-weight: 500;
    }
    /* Fix for dropdown text visibility */
    .stSelectbox [data-baseweb="select"] {
        color: #333 !important;
    }
    .stSelectbox [data-baseweb="select"] span {
        color: #333 !important;
        font-weight: 500;
    }
    /* Ensure selected values are visible */
    .stSelectbox .css-1d391kg {
        color: #333 !important;
    }
    /* Additional fixes for dropdown visibility */
    .stSelectbox div[data-baseweb="select"] {
        color: #333 !important;
    }
    .stSelectbox div[data-baseweb="select"] span {
        color: #333 !important;
        font-weight: 500;
    }
    /* Force text color for all select elements */
    .stSelectbox * {
        color: #333 !important;
    }
    /* Specific fix for the selected value display */
    .stSelectbox [data-testid="stSelectbox"] {
        color: #333 !important;
    }
    /* Fix for sidebar labels - make them white */
    .sidebar .stSelectbox label {
        color: white !important;
        font-weight: 600 !important;
    }
    .sidebar .stDateInput label {
        color: white !important;
        font-weight: 600 !important;
    }
    /* Fix for tab labels - improve spacing */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px !important;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 8px 16px !important;
        min-width: 120px !important;
    }
    .stTabs [data-baseweb="tab"] span {
        font-size: 14px !important;
        font-weight: 600 !important;
    }
    /* Ensure sidebar labels are visible */
    .sidebar .stMarkdown {
        color: white !important;
    }
    .sidebar .stMarkdown p {
        color: white !important;
    }
    /* Additional fixes for sidebar visibility */
    .sidebar .stSelectbox > label {
        color: white !important;
        font-weight: 600 !important;
        font-size: 16px !important;
    }
    .sidebar .stDateInput > label {
        color: white !important;
        font-weight: 600 !important;
        font-size: 16px !important;
    }
    /* Fix for any remaining grey text in sidebar */
    .sidebar * {
        color: white !important;
    }
    .sidebar .stSelectbox, .sidebar .stDateInput {
        color: white !important;
    }
    /* More specific selectors for Streamlit labels */
    [data-testid="stSelectbox"] label {
        color: white !important;
        font-weight: 600 !important;
        font-size: 16px !important;
    }
    [data-testid="stDateInput"] label {
        color: white !important;
        font-weight: 600 !important;
        font-size: 16px !important;
    }
    /* Force all text in sidebar to be white */
    .css-1d391kg, .css-1d391kg * {
        color: white !important;
    }
    /* Target specific Streamlit elements */
    .stSelectbox > div > div > div > div {
        color: white !important;
    }
    .stDateInput > div > div > div > div {
        color: white !important;
    }
    /* JavaScript to force label colors */
    <script>
    setTimeout(function() {
        const labels = document.querySelectorAll('label');
        labels.forEach(label => {
            if (label.textContent.includes('Time Period') || 
                label.textContent.includes('Payment Type') ||
                label.textContent.includes('Select Date Range')) {
                label.style.color = 'white';
                label.style.fontWeight = '600';
                label.style.fontSize = '16px';
            }
        });
    }, 1000);
    </script>
</style>
""", unsafe_allow_html=True)

@st.cache_data(ttl=600)  # Cache for 10 minutes - longer cache for larger dataset
def load_data_from_db():
    """Load data from Supabase PostgreSQL database with enhanced queries"""
    try:
        # Get Supabase connection from environment variable
        database_url = os.getenv('SUPABASE_DATABASE_URL')
        
        if not database_url:
            st.warning("⚠️ SUPABASE_DATABASE_URL not found. Running in demo mode with sample data.")
            return generate_demo_data()
        
        engine = sqlalchemy.create_engine(
            database_url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300
        )
        
        # Test connection first
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Optimized query - no ORDER BY for faster loading
        query = """
        SELECT 
            pickup_datetime,
            dropoff_datetime,
            pickup_location_id,
            dropoff_location_id,
            trip_distance,
            fare_amount,
            tip_amount,
            total_amount,
            payment_type,
            trip_duration_minutes,
            tip_percentage,
            EXTRACT(HOUR FROM pickup_datetime) as pickup_hour,
            EXTRACT(DOW FROM pickup_datetime) as pickup_day_of_week,
            EXTRACT(MONTH FROM pickup_datetime) as pickup_month,
            CASE 
                WHEN EXTRACT(HOUR FROM pickup_datetime) BETWEEN 6 AND 9 THEN 'Morning Rush'
                WHEN EXTRACT(HOUR FROM pickup_datetime) BETWEEN 17 AND 20 THEN 'Evening Rush'
                WHEN EXTRACT(HOUR FROM pickup_datetime) BETWEEN 22 AND 6 THEN 'Late Night'
                ELSE 'Regular Hours'
            END as time_period
        FROM taxi_trips
        """
        
        # Use chunked reading for better performance
        chunks = []
        chunk_size = 500000  # Process in 500K chunks
        
        # Get total count for progress tracking
        count_query = "SELECT COUNT(*) as total FROM taxi_trips"
        total_count = pd.read_sql(count_query, engine).iloc[0]['total']
        expected_chunks = (total_count // chunk_size) + 1
        
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        for i, chunk in enumerate(pd.read_sql(query, engine, chunksize=chunk_size)):
            # Convert datetime columns in chunks
            chunk['pickup_datetime'] = pd.to_datetime(chunk['pickup_datetime'])
            chunk['dropoff_datetime'] = pd.to_datetime(chunk['dropoff_datetime'])
            chunks.append(chunk)
            
            # Update progress
            progress = (i + 1) / expected_chunks
            progress_bar.progress(progress)
            status_text.text(f"Loading chunk {i+1}/{expected_chunks} ({len(chunks)*chunk_size:,} records loaded)")
        
        # Clear progress indicators
        progress_bar.empty()
        status_text.empty()
        
        # Combine all chunks
        df = pd.concat(chunks, ignore_index=True)
        
        # Add derived columns
        df['pickup_date'] = df['pickup_datetime'].dt.date
        df['pickup_week'] = df['pickup_datetime'].dt.isocalendar().week
        df['pickup_month_name'] = df['pickup_datetime'].dt.strftime('%B')
        
        # Add revenue metrics
        df['revenue_per_minute'] = df['total_amount'] / df['trip_duration_minutes']
        df['revenue_per_mile'] = df['total_amount'] / df['trip_distance']
        
        return df
        
    except Exception as e:
        st.warning(f"⚠️ Database connection failed: {str(e)}. Running in demo mode with sample data.")
        return generate_demo_data()

def generate_demo_data():
    """Generate sample NYC taxi data for demo purposes"""
    np.random.seed(42)  # For reproducible results
    
    # Generate 10,000 sample records
    n_records = 10000
    
    # Date range: Last 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Generate random pickup times
    pickup_times = pd.date_range(start=start_date, end=end_date, periods=n_records)
    
    # Generate sample data
    data = {
        'pickup_datetime': pickup_times,
        'dropoff_datetime': pickup_times + pd.Timedelta(minutes=np.random.uniform(5, 60, n_records)),
        'pickup_location_id': np.random.randint(1, 264, n_records),  # NYC has 263 taxi zones
        'dropoff_location_id': np.random.randint(1, 264, n_records),
        'trip_distance': np.random.uniform(0.5, 25, n_records),
        'fare_amount': np.random.uniform(2.5, 50, n_records),
        'tip_amount': np.random.uniform(0, 10, n_records),
        'total_amount': np.random.uniform(3, 60, n_records),
        'payment_type': np.random.choice([1, 2, 3, 4], n_records, p=[0.7, 0.2, 0.08, 0.02]),
        'trip_duration_minutes': np.random.uniform(5, 60, n_records),
        'tip_percentage': np.random.uniform(0, 25, n_records)
    }
    
    df = pd.DataFrame(data)
    
    # Add derived columns
    df['pickup_hour'] = df['pickup_datetime'].dt.hour
    df['pickup_day_of_week'] = df['pickup_datetime'].dt.dayofweek
    df['pickup_month'] = df['pickup_datetime'].dt.month
    df['pickup_date'] = df['pickup_datetime'].dt.date
    df['pickup_week'] = df['pickup_datetime'].dt.isocalendar().week
    df['pickup_month_name'] = df['pickup_datetime'].dt.strftime('%B')
    
    # Add time period classification
    df['time_period'] = df['pickup_hour'].apply(lambda x: 
        'Morning Rush' if 6 <= x <= 9 else
        'Evening Rush' if 17 <= x <= 20 else
        'Late Night' if x >= 22 or x <= 6 else
        'Regular Hours'
    )
    
    # Add revenue metrics
    df['revenue_per_minute'] = df['total_amount'] / df['trip_duration_minutes']
    df['revenue_per_mile'] = df['total_amount'] / df['trip_distance']
    
    return df




    

def create_nyc_choropleth(df):
    """Create NYC traffic choropleth map using official taxi zones"""
    if df.empty:
        return
    
    st.subheader("🗺️ NYC Traffic Activity by Taxi Zone")
    
    # Get zone aggregations from database
    try:
        database_url = os.getenv('SUPABASE_DATABASE_URL')
        
        if not database_url:
            st.warning("⚠️ Zone aggregation data not available in demo mode.")
            return
        
        engine = sqlalchemy.create_engine(database_url)
        
        # Get zone data with pickup and dropoff metrics
        zone_query = """
        SELECT 
            location_id,
            zone_name,
            borough,
            pickup_trips,
            pickup_revenue,
            dropoff_trips,
            dropoff_revenue,
            total_trips,
            total_revenue,
            pickup_avg_distance,
            pickup_avg_duration,
            pickup_avg_tip,
            dropoff_avg_distance,
            dropoff_avg_duration,
            dropoff_avg_tip
        FROM zone_aggregations 
        WHERE zone_name IS NOT NULL
        ORDER BY total_revenue DESC
        """
        
        zone_df = pd.read_sql(zone_query, engine)
        
        if zone_df.empty:
            st.warning("No zone aggregation data available. Please run the Airflow pipeline to generate zone data.")
            return
            
    except Exception as e:
        st.warning(f"⚠️ Zone data not available: {str(e)}. Skipping zone analysis.")
        return
    
    # Add map type selector
    map_type = st.selectbox(
        "Select Map Type:",
        ["Revenue Heatmap", "Trip Count Heatmap", "Pickup vs Dropoff"],
        help="Choose how to visualize the taxi activity"
    )
    
    # Create the choropleth map
    if map_type == "Revenue Heatmap":
        create_revenue_choropleth(zone_df)
    elif map_type == "Trip Count Heatmap":
        create_trip_count_choropleth(zone_df)
    else:
        create_pickup_dropoff_choropleth(zone_df)
    
    # Add analytics below the map
    col1, col2 = st.columns(2)
    
    with col1:
        # Top revenue zones
        top_revenue_zones = zone_df.nlargest(10, 'total_revenue')
        fig_revenue = px.bar(
            top_revenue_zones,
            x='zone_name',
            y='total_revenue',
            title="Top 10 Revenue Zones",
            labels={'total_revenue': 'Total Revenue ($)', 'zone_name': 'Zone'},
            color='total_revenue',
            color_continuous_scale='viridis'
        )
        fig_revenue.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig_revenue, use_container_width=True)
    
    with col2:
        # Most active zones
        top_active_zones = zone_df.nlargest(10, 'total_trips')
        fig_activity = px.bar(
            top_active_zones,
            x='zone_name',
            y='total_trips',
            title="Most Active Zones",
            labels={'total_trips': 'Total Trips', 'zone_name': 'Zone'},
            color='total_revenue',
            color_continuous_scale='viridis'
        )
        fig_activity.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig_activity, use_container_width=True)

def create_revenue_choropleth(zone_df):
    """Create revenue-based choropleth map"""
    # For now, create a simplified choropleth using location coordinates
    # In a full implementation, you'd load the actual GeoJSON and match zone IDs
    
    # Create a scatter map with zone centers
    fig = px.scatter_mapbox(
        zone_df.head(50),  # Top 50 zones
        lat=[40.7128 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(50).iterrows()],
        lon=[-74.0060 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(50).iterrows()],
        size='total_revenue',
        color='total_revenue',
        hover_name='zone_name',
        hover_data=['borough', 'pickup_trips', 'dropoff_trips', 'total_revenue'],
        color_continuous_scale='viridis',
        size_max=50,
        zoom=10,
        center=dict(lat=40.7128, lon=-74.0060),
        mapbox_style='carto-positron',
        title="NYC Taxi Revenue by Zone"
    )
    
    fig.update_layout(height=600)
    st.plotly_chart(fig, use_container_width=True)
    
    # Add zone statistics
    st.subheader("📊 Zone Statistics")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Revenue", f"${zone_df['total_revenue'].sum():,.0f}")
    with col2:
        st.metric("Total Trips", f"{zone_df['total_trips'].sum():,}")
    with col3:
        st.metric("Active Zones", f"{len(zone_df)}")
    with col4:
        st.metric("Avg Revenue/Zone", f"${zone_df['total_revenue'].mean():,.0f}")

def create_trip_count_choropleth(zone_df):
    """Create trip count-based choropleth map"""
    fig = px.scatter_mapbox(
        zone_df.head(50),
        lat=[40.7128 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(50).iterrows()],
        lon=[-74.0060 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(50).iterrows()],
        size='total_trips',
        color='total_trips',
        hover_name='zone_name',
        hover_data=['borough', 'pickup_trips', 'dropoff_trips', 'total_revenue'],
        color_continuous_scale='plasma',
        size_max=50,
        zoom=10,
        center=dict(lat=40.7128, lon=-74.0060),
        mapbox_style='carto-positron',
        title="NYC Taxi Trip Count by Zone"
    )
    
    fig.update_layout(height=600)
    st.plotly_chart(fig, use_container_width=True)

def create_pickup_dropoff_choropleth(zone_df):
    """Create pickup vs dropoff comparison map"""
    # Create two columns for side-by-side comparison
    col1, col2 = st.columns(2)
    
    with col1:
        fig_pickup = px.scatter_mapbox(
            zone_df.head(25),
            lat=[40.7128 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(25).iterrows()],
            lon=[-74.0060 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(25).iterrows()],
            size='pickup_trips',
            color='pickup_revenue',
            hover_name='zone_name',
            hover_data=['borough', 'pickup_trips', 'pickup_revenue'],
            color_continuous_scale='reds',
            size_max=40,
            zoom=10,
            center=dict(lat=40.7128, lon=-74.0060),
            mapbox_style='carto-positron',
            title="Pickup Activity"
        )
        fig_pickup.update_layout(height=500)
        st.plotly_chart(fig_pickup, use_container_width=True)
    
    with col2:
        fig_dropoff = px.scatter_mapbox(
            zone_df.head(25),
            lat=[40.7128 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(25).iterrows()],
            lon=[-74.0060 + (row['location_id'] % 20 - 10) * 0.01 for _, row in zone_df.head(25).iterrows()],
            size='dropoff_trips',
            color='dropoff_revenue',
            hover_name='zone_name',
            hover_data=['borough', 'dropoff_trips', 'dropoff_revenue'],
            color_continuous_scale='blues',
            size_max=40,
            zoom=10,
            center=dict(lat=40.7128, lon=-74.0060),
            mapbox_style='carto-positron',
            title="Dropoff Activity"
        )
        fig_dropoff.update_layout(height=500)
        st.plotly_chart(fig_dropoff, use_container_width=True)

def create_nyc_heatmap(df):
    """Create NYC traffic heatmap with activity zones (legacy function)"""
    if df.empty:
        return
    
    st.subheader("🗺️ NYC Traffic Activity Map (Legacy)")
    
    # Create pickup location heatmap
    pickup_heatmap = df.groupby('pickup_location_id').agg({
        'total_amount': 'sum',
        'trip_distance': 'mean',
        'trip_duration_minutes': 'mean',
        'tip_percentage': 'mean',
        'pickup_datetime': 'count'
    }).reset_index()
    pickup_heatmap.columns = ['location_id', 'total_revenue', 'avg_distance', 'avg_duration', 'avg_tip', 'trip_count']
    
    # Add location names
    pickup_heatmap['location_name'] = pickup_heatmap['location_id'].apply(get_nyc_location_name)
    
    # Create interactive map centered on NYC
    m = folium.Map(
        location=[40.7128, -74.0060],  # NYC coordinates
        zoom_start=12,
        tiles='cartodbpositron'
    )
    
    # Create activity zones based on location data
    activity_data = []
    for _, row in pickup_heatmap.head(50).iterrows():  # Top 50 locations
        # Convert location ID to approximate coordinates
        lat = 40.7128 + (row['location_id'] % 20 - 10) * 0.01
        lng = -74.0060 + (row['location_id'] % 20 - 10) * 0.01
        
        # Add multiple points around the location to create activity zones
        for i in range(5):  # Create 5 points per location
            activity_data.append([
                lat + (i - 2) * 0.002,  # Spread points around location
                lng + (i - 2) * 0.002,
                row['trip_count'] / 100  # Weight based on trip count
            ])
    
    # Add heatmap layer
    folium.plugins.HeatMap(
        activity_data,
        radius=25,
        blur=15,
        max_zoom=13,
        gradient={0.2: 'blue', 0.4: 'lime', 0.6: 'orange', 0.8: 'red'}
    ).add_to(m)
    
    # Add location markers for top locations
    for _, row in pickup_heatmap.head(15).iterrows():
        lat = 40.7128 + (row['location_id'] % 20 - 10) * 0.01
        lng = -74.0060 + (row['location_id'] % 20 - 10) * 0.01
        
        # Color based on revenue
        revenue_ratio = row['total_revenue'] / pickup_heatmap['total_revenue'].max()
        if revenue_ratio > 0.8:
            color = 'red'
        elif revenue_ratio > 0.6:
            color = 'orange'
        elif revenue_ratio > 0.4:
            color = 'yellow'
        else:
            color = 'green'
        
        folium.CircleMarker(
            location=[lat, lng],
            radius=8,
            popup=f"<b>{row['location_name']}</b><br>Revenue: ${row['total_revenue']:,.0f}<br>Trips: {row['trip_count']:,}<br>Avg Distance: {row['avg_distance']:.1f} miles",
            color=color,
            fill=True,
            fillColor=color,
            fillOpacity=0.7
        ).add_to(m)
    
    # Add clean legend
    legend_html = '''
    <div style="position: fixed; 
                bottom: 50px; left: 50px; width: 200px; height: 120px; 
                background-color: white; border:2px solid grey; z-index:9999; 
                font-size:12px; padding: 8px; border-radius: 5px;">
    <p><b>NYC Traffic Activity</b></p>
    <p>🔥 Heatmap: Trip Density</p>
    <p>🔴 Red: High Revenue</p>
    <p>🟠 Orange: Medium Revenue</p>
    <p>🟡 Yellow: Low Revenue</p>
    <p>🟢 Green: Very Low Revenue</p>
    </div>
    '''
    m.get_root().html.add_child(folium.Element(legend_html))
    
    # Display the map
    st_folium(m, width=800, height=500)
    
    # Add detailed analytics below the map
    col1, col2 = st.columns(2)
    
    with col1:
        # Top revenue locations with actual names
        top_locations = pickup_heatmap.nlargest(10, 'total_revenue')
        fig_top_revenue = px.bar(
            top_locations,
            x='location_name',
            y='total_revenue',
            title="Top 10 Revenue Locations",
            labels={'total_revenue': 'Total Revenue ($)', 'location_name': 'Location'},
            color='total_revenue',
            color_continuous_scale='viridis'
        )
        fig_top_revenue.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig_top_revenue, use_container_width=True)
    
    with col2:
        # Activity density by location
        activity_df = pickup_heatmap.nlargest(8, 'trip_count')
        fig_activity = px.bar(
            activity_df,
            x='location_name',
            y='trip_count',
            title="Most Active Locations",
            labels={'trip_count': 'Trip Count', 'location_name': 'Location'},
            color='total_revenue',
            color_continuous_scale='viridis'
        )
        fig_activity.update_layout(height=400, xaxis_tickangle=-45)
        st.plotly_chart(fig_activity, use_container_width=True)

def create_time_analysis(df):
    """Create enhanced time-based analysis"""
    if df.empty:
        return
    
    st.subheader("⏰ Time-Based Analysis")
    
    # Hourly analysis with multiple metrics
    hourly_analysis = df.groupby('pickup_hour').agg({
        'total_amount': ['sum', 'mean'],
        'trip_distance': 'mean',
        'tip_percentage': 'mean',
        'pickup_datetime': 'count'
    }).reset_index()
    hourly_analysis.columns = ['hour', 'total_revenue', 'avg_fare', 'avg_distance', 'avg_tip', 'trip_count']
    
    # Create subplot with multiple metrics
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Trip Count by Hour', 'Revenue by Hour', 'Average Fare by Hour', 'Average Tip % by Hour'),
        specs=[[{"secondary_y": False}, {"secondary_y": False}],
               [{"secondary_y": False}, {"secondary_y": False}]]
    )
    
    # Trip count
    fig.add_trace(
        go.Bar(x=hourly_analysis['hour'], y=hourly_analysis['trip_count'], name='Trip Count'),
        row=1, col=1
    )
    
    # Revenue
    fig.add_trace(
        go.Scatter(x=hourly_analysis['hour'], y=hourly_analysis['total_revenue'], name='Revenue', line=dict(color='red')),
        row=1, col=2
    )
    
    # Average fare
    fig.add_trace(
        go.Bar(x=hourly_analysis['hour'], y=hourly_analysis['avg_fare'], name='Avg Fare'),
        row=2, col=1
    )
    
    # Average tip
    fig.add_trace(
        go.Scatter(x=hourly_analysis['hour'], y=hourly_analysis['avg_tip'], name='Avg Tip %', line=dict(color='green')),
        row=2, col=2
    )
    
    fig.update_layout(height=600, showlegend=False)
    st.plotly_chart(fig, use_container_width=True)

def create_revenue_analysis(df):
    """Create enhanced revenue analysis"""
    if df.empty:
        return
    
    st.subheader("💰 Advanced Revenue Analysis")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Revenue by time period
        period_revenue = df.groupby('time_period')['total_amount'].sum().reset_index()
        
        fig_period = px.pie(
            period_revenue,
            values='total_amount',
            names='time_period',
            title="Revenue by Time Period",
            color_discrete_sequence=px.colors.qualitative.Set3
        )
        st.plotly_chart(fig_period, use_container_width=True)
    
    with col2:
        # Revenue efficiency (revenue per minute)
        efficiency_data = df.groupby('time_period').agg({
            'revenue_per_minute': 'mean',
            'revenue_per_mile': 'mean'
        }).reset_index()
        
        fig_efficiency = px.bar(
            efficiency_data,
            x='time_period',
            y=['revenue_per_minute', 'revenue_per_mile'],
            title="Revenue Efficiency by Time Period",
            barmode='group'
        )
        st.plotly_chart(fig_efficiency, use_container_width=True)

def create_correlation_analysis(df):
    """Create correlation analysis"""
    if df.empty:
        return
    
    st.subheader("📊 Correlation Analysis")
    
    # Select numeric columns for correlation
    numeric_cols = ['trip_distance', 'fare_amount', 'tip_amount', 'total_amount', 
                   'trip_duration_minutes', 'tip_percentage', 'revenue_per_minute', 'revenue_per_mile']
    
    correlation_df = df[numeric_cols].corr()
    
    fig_corr = px.imshow(
        correlation_df,
        title="Feature Correlation Matrix",
        color_continuous_scale='RdBu',
        aspect='auto'
    )
    fig_corr.update_layout(height=500)
    st.plotly_chart(fig_corr, use_container_width=True)

def create_interactive_filters(df):
    """Create interactive filters"""
    st.sidebar.subheader("🔍 Interactive Filters")
    
    # Date range filter
    min_date = df['pickup_datetime'].min().date()
    max_date = df['pickup_datetime'].max().date()
    
    st.sidebar.markdown('<p style="color: white; font-weight: 600; font-size: 16px; margin-bottom: 5px;">Select Date Range</p>', unsafe_allow_html=True)
    date_range = st.sidebar.date_input(
        "",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date,
        key="date_range"
    )
    
    # Time period filter
    time_periods = ['All', 'Morning Rush', 'Evening Rush', 'Late Night', 'Regular Hours']
    st.sidebar.markdown('<p style="color: white; font-weight: 600; font-size: 16px; margin-bottom: 5px;">Time Period</p>', unsafe_allow_html=True)
    selected_period = st.sidebar.selectbox("", time_periods, key="time_period")
    
    # Payment type filter
    payment_types = ['All', 'Credit Card', 'Cash', 'No Charge', 'Dispute', 'Unknown', 'Voided Trip']
    st.sidebar.markdown('<p style="color: white; font-weight: 600; font-size: 16px; margin-bottom: 5px;">Payment Type</p>', unsafe_allow_html=True)
    selected_payment = st.sidebar.selectbox("", payment_types, key="payment_type")
    
    # Apply filters
    filtered_df = df.copy()
    
    if len(date_range) == 2:
        filtered_df = filtered_df[
            (filtered_df['pickup_datetime'].dt.date >= date_range[0]) &
            (filtered_df['pickup_datetime'].dt.date <= date_range[1])
        ]
    
    if selected_period != 'All':
        filtered_df = filtered_df[filtered_df['time_period'] == selected_period]
    
    if selected_payment != 'All':
        payment_map = {
            'Credit Card': 1, 'Cash': 2, 'No Charge': 3,
            'Dispute': 4, 'Unknown': 5, 'Voided Trip': 6
        }
        filtered_df = filtered_df[filtered_df['payment_type'] == payment_map[selected_payment]]
    
    return filtered_df

def create_performance_metrics(df):
    """Create performance metrics dashboard"""
    if df.empty:
        return
    
    st.subheader("📈 NYC Taxi Performance Analytics")
    
    # Create tabs for different metrics
    tab1, tab2, tab3, tab4 = st.tabs(["🚀 Peak Performance", "💰 Revenue Insights", "⏰ Time Analysis", "📍 Location Intelligence"])
    
    with tab1:
        col1, col2 = st.columns(2)
        
        with col1:
            # Peak hours analysis with visualization
            peak_hours = df.groupby('pickup_hour')['total_amount'].sum().nlargest(5)
            fig_peak = px.bar(
                x=peak_hours.index,
                y=peak_hours.values,
                title="Peak Revenue Hours",
                labels={'x': 'Hour of Day', 'y': 'Total Revenue ($)'},
                color=peak_hours.values,
                color_continuous_scale='viridis'
            )
            fig_peak.update_layout(height=300)
            st.plotly_chart(fig_peak, use_container_width=True)
        
        with col2:
            # Efficiency metrics
            avg_revenue_per_minute = df['revenue_per_minute'].mean()
            avg_revenue_per_mile = df['revenue_per_mile'].mean()
            avg_tip_percentage = df['tip_percentage'].mean()
            
            st.metric("Revenue/Minute", f"${avg_revenue_per_minute:.2f}")
            st.metric("Revenue/Mile", f"${avg_revenue_per_mile:.2f}")
            st.metric("Avg Tip %", f"{avg_tip_percentage:.1f}%")
    
    with tab2:
        col1, col2 = st.columns(2)
        
        with col1:
            # Revenue distribution
            fig_revenue_dist = px.histogram(
                df,
                x='total_amount',
                nbins=50,
                title="Revenue Distribution",
                labels={'total_amount': 'Trip Revenue ($)', 'count': 'Number of Trips'}
            )
            fig_revenue_dist.update_layout(height=300)
            st.plotly_chart(fig_revenue_dist, use_container_width=True)
        
        with col2:
            # Revenue by payment type
            payment_revenue = df.groupby('payment_type')['total_amount'].sum()
            payment_labels = {1: 'Credit Card', 2: 'Cash', 3: 'No Charge', 4: 'Dispute', 5: 'Unknown', 6: 'Voided Trip'}
            payment_revenue.index = [payment_labels.get(x, f'Type {x}') for x in payment_revenue.index]
            
            fig_payment = px.pie(
                values=payment_revenue.values,
                names=payment_revenue.index,
                title="Revenue by Payment Type"
            )
            fig_payment.update_layout(height=300)
            st.plotly_chart(fig_payment, use_container_width=True)
    
    with tab3:
        col1, col2 = st.columns(2)
        
        with col1:
            # Day of week analysis
            df['day_name'] = df['pickup_datetime'].dt.day_name()
            day_revenue = df.groupby('day_name')['total_amount'].sum().reindex(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
            
            fig_day = px.line(
                x=day_revenue.index,
                y=day_revenue.values,
                title="Revenue by Day of Week",
                labels={'x': 'Day', 'y': 'Total Revenue ($)'}
            )
            fig_day.update_layout(height=300)
            st.plotly_chart(fig_day, use_container_width=True)
        
        with col2:
            # Time period analysis
            period_stats = df.groupby('time_period').agg({
                'total_amount': ['sum', 'mean'],
                'trip_duration_minutes': 'mean',
                'tip_percentage': 'mean'
            }).round(2)
            
            st.markdown("**Time Period Analysis:**")
            for period in period_stats.index:
                revenue = period_stats.loc[period, ('total_amount', 'sum')]
                avg_fare = period_stats.loc[period, ('total_amount', 'mean')]
                avg_duration = period_stats.loc[period, ('trip_duration_minutes', 'mean')]
                avg_tip = period_stats.loc[period, ('tip_percentage', 'mean')]
                
                st.markdown(f"**{period}:**")
                st.markdown(f"- Total Revenue: ${revenue:,.0f}")
                st.markdown(f"- Avg Fare: ${avg_fare:.2f}")
                st.markdown(f"- Avg Duration: {avg_duration:.1f} min")
                st.markdown(f"- Avg Tip: {avg_tip:.1f}%")
    
    with tab4:
        col1, col2 = st.columns(2)
        
        with col1:
            # Top locations with more details and actual names
            top_locations = df.groupby('pickup_location_id').agg({
                'total_amount': 'sum',
                'trip_distance': 'mean',
                'trip_duration_minutes': 'mean',
                'tip_percentage': 'mean',
                'pickup_datetime': 'count'
            }).nlargest(10, 'total_amount')
            
            # Add location names
            top_locations['location_name'] = top_locations.index.map(get_nyc_location_name)
            
            fig_top_loc = px.bar(
                x=top_locations['location_name'],
                y=top_locations['total_amount'],
                title="Top 10 Revenue Locations",
                labels={'x': 'Location', 'y': 'Total Revenue ($)'},
                color=top_locations['trip_distance'],
                color_continuous_scale='viridis'
            )
            fig_top_loc.update_layout(height=300, xaxis_tickangle=-45)
            st.plotly_chart(fig_top_loc, use_container_width=True)
        
        with col2:
            # Location efficiency with names
            location_efficiency = df.groupby('pickup_location_id').agg({
                'revenue_per_minute': 'mean',
                'revenue_per_mile': 'mean',
                'tip_percentage': 'mean'
            }).nlargest(10, 'revenue_per_minute')
            
            # Add location names
            location_efficiency['location_name'] = location_efficiency.index.map(get_nyc_location_name)
            
            st.markdown("**Most Efficient Locations:**")
            for loc in location_efficiency.head(5).index:
                location_name = get_nyc_location_name(loc)
                rev_per_min = location_efficiency.loc[loc, 'revenue_per_minute']
                rev_per_mile = location_efficiency.loc[loc, 'revenue_per_mile']
                tip_pct = location_efficiency.loc[loc, 'tip_percentage']
                
                st.markdown(f"**{location_name}:**")
                st.markdown(f"- Revenue/Min: ${rev_per_min:.2f}")
                st.markdown(f"- Revenue/Mile: ${rev_per_mile:.2f}")
                st.markdown(f"- Avg Tip: {tip_pct:.1f}%")

def main():
    # Header
    st.markdown('<h1 class="main-header">🚕 NYC Taxi Analytics Dashboard</h1>', unsafe_allow_html=True)
    
    # Load data with progress indicator
    with st.spinner("🔄 Loading ALL NYC taxi data (3.6M+ records)..."):
        df = load_data_from_db()
    
    if df.empty:
        st.error("❌ No data available. Please ensure the data pipeline has been run and data is available in the database.")
        return
    
    # Create interactive filters
    filtered_df = create_interactive_filters(df)
    
    # Display data info
    st.sidebar.markdown("**📊 Data Overview:**")
    st.sidebar.markdown(f"- **Total Records:** {len(filtered_df):,}")
    st.sidebar.markdown(f"- **Date Range:** {filtered_df['pickup_datetime'].min().strftime('%Y-%m-%d')} to {filtered_df['pickup_datetime'].max().strftime('%Y-%m-%d')}")
    st.sidebar.markdown(f"- **Total Revenue:** ${filtered_df['total_amount'].sum():,.0f}")
    st.sidebar.markdown(f"- **Avg Trip Duration:** {filtered_df['trip_duration_minutes'].mean():.1f} min")
    st.sidebar.markdown(f"- **Avg Distance:** {filtered_df['trip_distance'].mean():.2f} miles")
    
    # Data refresh button
    if st.sidebar.button("🔄 Refresh Data"):
        st.cache_data.clear()
        st.rerun()
    
    # Enhanced metrics
    st.markdown("## 📊 Key Performance Indicators")
    create_enhanced_metrics(filtered_df)
    
    # NYC Map Visualization
    st.markdown("## 🗺️ NYC Traffic Visualization")
    
    # Add visualization type selector
    viz_type = st.selectbox(
        "Choose Map Type:",
        ["New Choropleth Map", "Legacy Heatmap"],
        help="Select the type of map visualization"
    )
    
    if viz_type == "New Choropleth Map":
        create_nyc_choropleth(filtered_df)
    else:
        create_nyc_heatmap(filtered_df)
    
    # Time analysis
    create_time_analysis(filtered_df)
    
    # Revenue analysis
    create_revenue_analysis(filtered_df)
    
    # Performance metrics
    create_performance_metrics(filtered_df)
    
    # Correlation analysis
    create_correlation_analysis(filtered_df)
    
    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666;'>
        <p>🚕 <strong>NYC Taxi Analytics Dashboard</strong> | Powered by Streamlit, Apache Airflow & PostgreSQL</p>
        <p>Real-time analytics from millions of NYC taxi trips</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main() 