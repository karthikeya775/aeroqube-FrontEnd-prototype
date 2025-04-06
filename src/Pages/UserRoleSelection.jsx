import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Grid, Typography, Box, Container } from "@mui/material";
import { User, Settings } from "lucide-react";

const UserRoleSelection = () => {
  const navigate = useNavigate();
  
  const handleRoleSelect = (role) => {
    navigate(`/${role}`);
  };
  
  return (
    <Container maxWidth="md" sx={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      minHeight: "100vh",
      py: 4
    }}>
      {/* Main Heading */}
      <Typography
        variant="h2"
        fontWeight="bold"
        color="primary"
        sx={{ marginBottom: "1rem", textAlign: "center" }}
      >
        Welcome to NewsApp
      </Typography>
      
      <Typography
        variant="h6"
        color="textSecondary"
        sx={{ marginBottom: "2rem", textAlign: "center" }}
      >
        Please select your role to continue
      </Typography>
      
      {/* Role Selection Cards */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ width: "100%" }}
      >
        {/* User Role Card */}
        <Grid item xs={12} sm={6} md={5}>
          <Card
            sx={{
              textAlign: "center",
              padding: "2rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 4px 10px rgba(0,0,0,0.2)" },
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <User size={40} color="#1976d2" />
              <Typography variant="h5" fontWeight="bold" color="primary" sx={{ marginTop: "1rem" }}>
                User
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ marginBottom: "1.5rem" }}>
                Browse the latest news.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleRoleSelect("dashboard")}
                sx={{ py: 1 }}
              >
                CONTINUE AS USER
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Admin Role Card */}
        <Grid item xs={12} sm={6} md={5}>
          <Card
            sx={{
              textAlign: "center",
              padding: "2rem",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s",
              "&:hover": { boxShadow: "0 4px 10px rgba(0,0,0,0.2)" },
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <Settings size={40} color="#388e3c" />
              <Typography variant="h5" fontWeight="bold" sx={{ marginTop: "1rem", color: "#388e3c" }}>
                Admin
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ marginBottom: "1.5rem" }}>
                Manage news articles.
              </Typography>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => handleRoleSelect("admin")}
                sx={{ py: 1 }}
              >
                CONTINUE AS ADMIN
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserRoleSelection;