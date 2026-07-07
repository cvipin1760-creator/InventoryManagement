import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import { Box, Card, CardContent, Typography, Tooltip as MuiTooltip } from "@mui/material";

const geoUrl = "/features.json";

const markers = [
  { markerOffset: -15, name: "Shop Alpha (Delhi)", coordinates: [77.2090, 28.6139] as [number, number], revenue: "₹5.1L", customers: 180, orders: 500, growth: "-2%", health: "Warning" },
  { markerOffset: -15, name: "Shop Beta (Mumbai)", coordinates: [72.8777, 19.0760] as [number, number], revenue: "₹8.2L", customers: 300, orders: 820, growth: "+18%", health: "Excellent" },
  { markerOffset: 15, name: "Shop Gamma (Bangalore)", coordinates: [77.5946, 12.9716] as [number, number], revenue: "₹9.5L", customers: 420, orders: 1100, growth: "+25%", health: "Excellent" },
  { markerOffset: 15, name: "Shop Delta (Chennai)", coordinates: [80.2707, 13.0827] as [number, number], revenue: "₹3.8L", customers: 90, orders: 310, growth: "+5%", health: "Good" },
  { markerOffset: -15, name: "Shop Epsilon (Kolkata)", coordinates: [88.3639, 22.5726] as [number, number], revenue: "₹4.5L", customers: 120, orders: 450, growth: "+12%", health: "Good" },
];

const ShopLocationsMap = () => {
  return (
    <Card sx={{ borderRadius: 3, height: '100%', minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Live Shop Locations
        </Typography>
        <Box sx={{ width: "100%", height: 350, overflow: 'hidden', borderRadius: 2, backgroundColor: '#f8fafc' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 800,
              center: [80, 22] // Centered on India
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e2e8f0"
                    stroke="#cbd5e1"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#cbd5e1", outline: "none" },
                      pressed: { outline: "none" }
                    }}
                  />
                ))
              }
            </Geographies>
            {markers.map(({ name, coordinates, revenue, customers, orders, growth, health }) => (
              <Marker key={name} coordinates={coordinates}>
                <MuiTooltip 
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">{name}</Typography>
                      <Typography variant="caption" display="block">Revenue: {revenue}</Typography>
                      <Typography variant="caption" display="block">Customers: {customers}</Typography>
                      <Typography variant="caption" display="block">Orders: {orders}</Typography>
                      <Typography variant="caption" display="block">Growth: {growth}</Typography>
                      <Typography variant="caption" display="block">Health: {health}</Typography>
                    </Box>
                  }
                  placement="top"
                  arrow
                >
                  <circle 
                    r={6} 
                    fill="#2563EB" 
                    stroke="#ffffff" 
                    strokeWidth={2} 
                    style={{ cursor: "pointer" }} 
                  />
                </MuiTooltip>
              </Marker>
            ))}
          </ComposableMap>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ShopLocationsMap;
