export interface TaxiTrip {
  id?: number;
  pickup_datetime: string;
  dropoff_datetime: string;
  pickup_location_id: number | null;
  dropoff_location_id: number | null;
  trip_distance: number | null;
  fare_amount: number | null;
  tip_amount: number | null;
  total_amount: number | null;
  payment_type: number | null;
  trip_duration_minutes: number | null;
  tip_percentage: number | null;
  created_at?: string;
} 