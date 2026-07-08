import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Card, CardContent, Typography } from "@mui/material";
import L from 'leaflet';

// Fix Leaflet's default icon path issues with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const markers = [
  { name: "Shop Alpha (Delhi)", coordinates: [28.6139, 77.2090] as [number, number], revenue: "₹5.1L", customers: 180, orders: 500, growth: "-2%", health: "Warning" },
  { name: "Shop Beta (Mumbai)", coordinates: [19.0760, 72.8777] as [number, number], revenue: "₹8.2L", customers: 300, orders: 820, growth: "+18%", health: "Excellent" },
  { name: "Shop Gamma (Bangalore)", coordinates: [12.9716, 77.5946] as [number, number], revenue: "₹9.5L", customers: 420, orders: 1100, growth: "+25%", health: "Excellent" },
  { name: "Shop Delta (Chennai)", coordinates: [13.0827, 80.2707] as [number, number], revenue: "₹3.8L", customers: 90, orders: 310, growth: "+5%", health: "Good" },
  { name: "Shop Epsilon (Kolkata)", coordinates: [22.5726, 88.3639] as [number, number], revenue: "₹4.5L", customers: 120, orders: 450, growth: "+12%", health: "Good" },
];

const ShopLocationsMap = () => {
  return (
    <Card sx={{ borderRadius: 3, height: '100%', minHeight: 400 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Live Shop Locations
        </Typography>
        <Box sx={{ width: "100%", flexGrow: 1, minHeight: 350, overflow: 'hidden', borderRadius: 2, backgroundColor: '#f8fafc' }}>
          <MapContainer center={[22, 80]} zoom={4} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker key={marker.name} position={marker.coordinates}>
                <Popup>
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{marker.name}</Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>Revenue: {marker.revenue}</Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>Customers: {marker.customers}</Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>Orders: {marker.orders}</Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>Growth: {marker.growth}</Typography>
                    <Typography variant="caption" sx={{ display: 'block' }}>Health: {marker.health}</Typography>
                  </Box>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ShopLocationsMap;
