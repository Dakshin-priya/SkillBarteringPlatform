import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
  Autocomplete,
  Checkbox,
  IconButton,
  Rating,
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ProfilePage() {
  const { currentUser, userLocation, setUserLocation } =
    useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    linkedin: "",
    instagram: "",
    profilePicture: "",
    skillsOffered: [],
    skillsNeeded: [],
    points: 0,
    latitude: null,
    longitude: null,
    city: "",
    displayOnMarketplace: false, // New field to control marketplace visibility
  });
  const [offerDetails, setOfferDetails] = useState({});
  const [needDescriptions, setNeedDescriptions] = useState({});
  const [editing, setEditing] = useState(false);

  const skillOptions = [
    "Graphic Design",
    "Web Development",
    "Writing",
    "Photography",
    "Video Editing",
    "Music Production",
    "Cooking",
    "Tutoring (Math)",
    "Tutoring (Language)",
    "Fitness Training",
    "Gardening",
    "Carpentry",
    "Plumbing",
    "Electrical Work",
    "Sewing",
    "Painting",
    "Yoga Instruction",
    "Digital Marketing",
  ];

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser, userLocation]);

  const fetchProfile = async () => {
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const migratedSkillsOffered = (data.skillsOffered || []).map(
        (skillObj) =>
          typeof skillObj === "string"
            ? { skill: skillObj, description: "", rating: 0, years: 0, document: "" }
            : {
                skill: skillObj.skill || skillObj,
                description: skillObj.description || "",
                rating: skillObj.rating || 0,
                years: skillObj.years || 0,
                document: skillObj.document || "",
              }
      );
      const migratedSkillsNeeded = (data.skillsNeeded || []).map(
        (skillObj) =>
          typeof skillObj === "string"
            ? { skill: skillObj, description: "" }
            : skillObj
      );
      setProfile({
        displayName: data.displayName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        linkedin: data.linkedin || "",
        instagram: data.instagram || "",
        profilePicture: data.profilePicture || "",
        skillsOffered: migratedSkillsOffered,
        skillsNeeded: migratedSkillsNeeded,
        points: data.points || 0,
        latitude: data.latitude || userLocation?.lat || null,
        longitude: data.longitude || userLocation?.lng || null,
        city: data.city || "",
        displayOnMarketplace: data.displayOnMarketplace || false, // Load marketplace visibility setting
      });
      const offerDet = {};
      const needDesc = {};
      migratedSkillsOffered.forEach((s) => {
        offerDet[s.skill] = {
          description: s.description || "",
          rating: s.rating || 0,
          years: s.years || 0,
          document: s.document || "",
        };
      });
      migratedSkillsNeeded.forEach((s) => {
        needDesc[s.skill] = s.description || "";
      });
      setOfferDetails(offerDet);
      setNeedDescriptions(needDesc);
    } else {
      await setDoc(doc(db, "users", currentUser.uid), {
        displayName: "",
        email: "",
        phoneNumber: "",
        linkedin: "",
        instagram: "",
        profilePicture: "",
        skillsOffered: [],
        skillsNeeded: [],
        points: 0,
        latitude: null,
        longitude: null,
        city: "",
        displayOnMarketplace: false, // Default to hidden
      });
    }
  };

  const handleUpdate = async () => {
    if (!currentUser) return;
    try {
      const validSkillsOffered = profile.skillsOffered.filter(
        (s) => s.skill && skillOptions.includes(s.skill)
      );
      const validSkillsNeeded = profile.skillsNeeded.filter(
        (s) => s.skill && skillOptions.includes(s.skill)
      );
      const updatedProfile = {
        ...profile,
        displayName: profile.displayName || currentUser.displayName,
        city: profile.city || "",
        skillsOffered: validSkillsOffered.map((s) => ({
          skill: s.skill,
          description: offerDetails[s.skill].description || "",
          rating: offerDetails[s.skill].rating || 0,
          years: offerDetails[s.skill].years || 0,
          document: offerDetails[s.skill].document || "",
        })),
        skillsNeeded: validSkillsNeeded.map((s) => ({
          skill: s.skill,
          description: needDescriptions[s.skill] || "",
        })),
      };
      await setDoc(doc(db, "users", currentUser.uid), updatedProfile, { merge: true });
      alert("Profile updated!");
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      alert(`Error updating profile: ${error.message}`);
    }
  };

  const updateSkills = (type, newSkillArray) => {
    const updatedSkills = newSkillArray.map((skill) => ({
      skill,
      description:
        type === "skillsOffered"
          ? offerDetails[skill].description || ""
          : needDescriptions[skill] || "",
      rating: type === "skillsOffered" ? offerDetails[skill].rating || 0 : 0,
      years: type === "skillsOffered" ? offerDetails[skill].years || 0 : 0,
      document: type === "skillsOffered" ? offerDetails[skill].document || "" : "",
    }));
    setProfile((prev) => ({ ...prev, [type]: updatedSkills }));
  };

  const handleDetailChange = (type, skill, field, value) => {
    if (type === "skillsOffered") {
      setOfferDetails((prev) => ({
        ...prev,
        [skill]: {
          ...prev[skill],
          [field]: value,
        },
      }));
    } else {
      setNeedDescriptions((prev) => ({
        ...prev,
        [skill]: value,
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profilePicture: URL.createObjectURL(file) });
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setProfile((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
          alert("Location detected and updated!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(
            "Failed to detect location. Please enable location permissions or enter manually."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleLocationChange = (e, field) => {
    const value = e.target.value ? parseFloat(e.target.value) : null;
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (skill, e) => {
    const file = e.target.files[0];
    if (file) {
      const documentUrl = URL.createObjectURL(file);
      handleDetailChange("skillsOffered", skill, "document", documentUrl);
    }
  };

  const handleMarketplaceToggle = (event) => {
    setProfile({ ...profile, displayOnMarketplace: event.target.checked });
  };

  if (!currentUser) return <Typography variant="h6">Please log in</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: "2rem auto", padding: 4, backgroundColor: "#f5f7fa", borderRadius: 2 }}>
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          borderRadius: 2,
          background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
          position: "relative",
        }}
      >
        {!editing && (
          <IconButton
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#333",
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
              padding: 1,
            }}
            onClick={() => setEditing(true)}
          >
            <EditIcon />
          </IconButton>
        )}

        {editing ? (
          <>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, color: "#1a2a44", mb: 4, textAlign: "center" }}
            >
              Edit Profile
            </Typography>

            <Box sx={{ mb: 4, textAlign: "center" }}>
              <img
                src={profile.profilePicture || "/default-profile.jpg"}
                alt="Profile"
                onError={(e) => { e.target.src = "/fallback-image.jpg"; }}
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "5px solid #e0e0e0",
                  mb: 2,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  backgroundColor: "#2c3e50",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#34495e" },
                  padding: "10px 20px",
                  borderRadius: 8,
                }}
              >
                Upload Profile Picture
                <input type="file" hidden onChange={handleProfilePictureChange} />
              </Button>
            </Box>

            <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: "#ffffff" }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile.phoneNumber}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profile.displayOnMarketplace}
                        onChange={handleMarketplaceToggle}
                        color="primary"
                      />
                    }
                    label="Display on Marketplace"
                    labelPlacement="end"
                    sx={{ ml: 0, mt: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Enable this to make your profile visible on the marketplace page.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: "#ffffff" }}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<LocationOnIcon />}
                  onClick={handleDetectLocation}
                  sx={{ mb: 2, color: "#2c3e50", borderColor: "#2c3e50", "&:hover": { borderColor: "#34495e", color: "#34495e" } }}
                >
                  Detect My Location
                </Button>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    id="latitude-input"
                    name="latitude"
                    value={profile.latitude || ""}
                    onChange={(e) => handleLocationChange(e, "latitude")}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                    helperText={profile.latitude ? "Edit if needed" : 'Click "Detect My Location" or enter manually (e.g., 37.7749)'}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    id="longitude-input"
                    name="longitude"
                    value={profile.longitude || ""}
                    onChange={(e) => handleLocationChange(e, "longitude")}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                    helperText={profile.longitude ? "Edit if needed" : 'Click "Detect My Location" or enter manually (e.g., -122.4194)'}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    variant="outlined"
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                    helperText="Enter your city (e.g., San Francisco)"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h5" sx={{ color: "#1a2a44", mb: 2, fontWeight: 600 }}>
                Skills Offered
              </Typography>
              <Autocomplete
                multiple
                options={skillOptions}
                value={profile.skillsOffered.map((s) => s.skill)}
                onChange={(_, newValue) => updateSkills("skillsOffered", newValue)}
                disableCloseOnSelect
                getOptionLabel={(option) => option}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                    {option}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={option} sx={{ m: 0.5 }} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Skills Offered"
                    placeholder="Search or select skills"
                    fullWidth
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                  />
                )}
              />
              {profile.skillsOffered.map((item) => (
                <Box key={item.skill} sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1, backgroundColor: "#fafafa" }}>
                  <TextField
                    label={`Description for ${item.skill}`}
                    value={offerDetails[item.skill].description || ""}
                    onChange={(e) => handleDetailChange("skillsOffered", item.skill, "description", e.target.value)}
                    variant="outlined"
                    fullWidth
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1, mb: 2 }}
                  />
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 500, color: "#1a2a44" }}>Expertise Rating (1-5):</Typography>
                    <Rating
                      value={offerDetails[item.skill].rating || 0}
                      onChange={(e, newValue) => handleDetailChange("skillsOffered", item.skill, "rating", newValue)}
                      precision={0.5}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <TextField
                    label="Years of Experience"
                    type="number"
                    value={offerDetails[item.skill].years || 0}
                    onChange={(e) => handleDetailChange("skillsOffered", item.skill, "years", parseInt(e.target.value) || 0)}
                    variant="outlined"
                    fullWidth
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1, mb: 2 }}
                    inputProps={{ min: 0 }}
                  />
                  <Button
                    variant="contained"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mb: 2, backgroundColor: "#2c3e50", "&:hover": { backgroundColor: "#34495e" }, borderRadius: 8 }}
                  >
                    Upload Document
                    <input type="file" hidden onChange={(e) => handleDocumentUpload(item.skill, e)} />
                  </Button>
                  {offerDetails[item.skill].document && (
                    <Typography sx={{ mt: 1, color: "#2c3e50" }}>
                      Document: <a href={offerDetails[item.skill].document} target="_blank" rel="noopener noreferrer">View</a>
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper>

            <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h5" sx={{ color: "#1a2a44", mb: 2, fontWeight: 600 }}>
                Skills Needed
              </Typography>
              <Autocomplete
                multiple
                options={skillOptions}
                value={profile.skillsNeeded.map((s) => s.skill)}
                onChange={(_, newValue) => updateSkills("skillsNeeded", newValue)}
                disableCloseOnSelect
                getOptionLabel={(option) => option}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                    {option}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={option} sx={{ m: 0.5 }} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Skills Needed"
                    placeholder="Search or select skills"
                    fullWidth
                    sx={{ backgroundColor: "#f9f9f9", borderRadius: 1 }}
                  />
                )}
              />
              {profile.skillsNeeded.map((item) => (
                <TextField
                  key={item.skill}
                  label={`Description for ${item.skill}`}
                  value={needDescriptions[item.skill] || ""}
                  onChange={(e) => handleDetailChange("skillsNeeded", item.skill, "description", e.target.value)}
                  variant="outlined"
                  fullWidth
                  sx={{ backgroundColor: "#f9f9f9", borderRadius: 1, mt: 2 }}
                />
              ))}
            </Paper>

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                sx={{ mt: 2, padding: "12px 30px", fontWeight: 600, backgroundColor: "#2c3e50", "&:hover": { backgroundColor: "#34495e" }, borderRadius: 8 }}
              >
                Save Changes
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box sx={{ textAlign: "center", mb: 4, position: "relative" }}>
              {profile.profilePicture && (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  style={{
                    width: "180px",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "5px solid #e0e0e0",
                    mb: 2,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                />
              )}
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, color: "#1a2a44", mb: 1 }}
              >
                {profile.displayName || currentUser.displayName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Email: {profile.email}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Phone: {profile.phoneNumber}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                LinkedIn: {profile.linkedin}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Instagram: {profile.instagram}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Location: {profile.latitude}, {profile.longitude}
              </Typography>
            </Box>

            <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h5" sx={{ color: "#1a2a44", mb: 2, fontWeight: 600 }}>
                Skills Offered
              </Typography>
              {profile.skillsOffered.map((item) => (
                <Box
                  key={item.skill}
                  sx={{ mb: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1, backgroundColor: "#fafafa" }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 500, color: "#1a2a44", mb: 1 }}>
                    {item.skill}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Description: {item.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expertise: {item.rating} / 5 stars
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Experience: {item.years} years
                  </Typography>
                  {item.document && (
                    <Typography variant="body2" color="text.secondary">
                      Document: <a href={item.document} target="_blank" rel="noopener noreferrer">View</a>
                    </Typography>
                  )}
                </Box>
              ))}
            </Paper>

            <Paper elevation={4} sx={{ p: 3, borderRadius: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="h5" sx={{ color: "#1a2a44", mb: 2, fontWeight: 600 }}>
                Skills Needed
              </Typography>
              {profile.skillsNeeded.map((item) => (
                <Typography
                  key={item.skill}
                  variant="body1"
                  sx={{ mb: 1, color: "text.secondary" }}
                >
                  {item.skill}: {needDescriptions[item.skill]}
                </Typography>
              ))}
            </Paper>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default ProfilePage;