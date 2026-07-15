import React, { useState } from "react";
import {
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Slider,
  Alert,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import Card from "../components/Card";
import { useOrders } from "../context/OrderContext";

export default function Order() {
  const { addOrder } = useOrders();
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<"employee" | "boss">("employee");
  const [password, setPassword] = useState("");
  const [timeType, setTimeType] = useState<"now" | "later">("now");
  const [delayMinutes, setDelayMinutes] = useState<number>(5);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmitError(null);
    setSuccess(false);

    // Form validations
    if (!userName.trim()) {
      setValidationError("Name is required.");
      return;
    }
    if (userName.trim().length < 2) {
      setValidationError("Name must be at least 2 characters.");
      return;
    }
    if (role === "boss" && !password) {
      setValidationError("Boss authorization password is required.");
      return;
    }
    if (timeType === "later" && (isNaN(delayMinutes) || delayMinutes < 1)) {
      setValidationError("Delay must be at least 1 minute.");
      return;
    }

    setLoading(true);

    try {
      await addOrder({
        userName: userName.trim(),
        role,
        password: role === "boss" ? password : undefined,
        timeType,
        delayMinutes: timeType === "later" ? delayMinutes : 0,
      });

      setSuccess(true);
      // Reset form fields
      setUserName("");
      setPassword("");
      setTimeType("now");
      setDelayMinutes(5);
    } catch (err: any) {
      setSubmitError(err.message || "Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            margin: 0,
            background:
              "linear-gradient(to right, var(--text-primary), var(--accent-primary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Order Coffee
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "0.5rem 0 0 0" }}>
          Request a fresh cup of coffee. Boss requests get priority.
        </p>
      </div>

      <Card variant="default" style={{ padding: "2.5rem" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
        >
          {/* Status Alerts */}
          {validationError && (
            <Alert severity="warning" sx={{ borderRadius: "12px" }}>
              {validationError}
            </Alert>
          )}
          {submitError && (
            <Alert severity="error" sx={{ borderRadius: "12px" }}>
              {submitError}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ borderRadius: "12px" }}>
              Coffee order successfully sent to queue!
            </Alert>
          )}

          {/* User Name input */}
          <TextField
            label="Your Name"
            variant="outlined"
            fullWidth
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            placeholder="Enter your name"
            sx={{
              "& label": { color: "text.secondary" },
              "& label.Mui-focused": { color: "primary.main" },
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                "& fieldset": {
                  borderColor: "var(--border-color)",
                  borderRadius: "12px",
                },
                "&:hover fieldset": { borderColor: "var(--border-focus)" },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
          />

          {/* Role selection */}
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "text.primary",
                "&.Mui-focused": { color: "text.primary" },
              }}
            >
              Role
            </FormLabel>
            <RadioGroup
              row
              name="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as "employee" | "boss");
                setPassword("");
              }}
              sx={{ gap: "1.5rem", mt: 0.5 }}
            >
              <FormControlLabel
                value="employee"
                control={
                  <Radio
                    sx={{
                      color: "var(--border-color)",
                      "&.Mui-checked": { color: "primary.main" },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: "0.95rem", color: "text.primary" }}
                  >
                    Employee (Normal Queue)
                  </Typography>
                }
              />
              <FormControlLabel
                value="boss"
                control={
                  <Radio
                    sx={{
                      color: "var(--border-color)",
                      "&.Mui-checked": { color: "primary.main" },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: "0.95rem", color: "text.primary" }}
                  >
                    Boss (VIP Queue)
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Password input (only if Boss) */}
          {role === "boss" && (
            <TextField
              className="fade-in"
              label="Authorization Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter VIP Password"
              sx={{
                "& label": { color: "text.secondary" },
                "& label.Mui-focused": { color: "primary.main" },
                "& .MuiOutlinedInput-root": {
                  color: "text.primary",
                  "& fieldset": {
                    borderColor: "var(--border-color)",
                    borderRadius: "12px",
                  },
                  "&:hover fieldset": { borderColor: "var(--border-focus)" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
            />
          )}

          {/* Time select */}
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "text.primary",
                "&.Mui-focused": { color: "text.primary" },
              }}
            >
              Preparation Time
            </FormLabel>
            <RadioGroup
              row
              name="timeType"
              value={timeType}
              onChange={(e) => setTimeType(e.target.value as "now" | "later")}
              sx={{ gap: "1.5rem", mt: 0.5 }}
            >
              <FormControlLabel
                value="now"
                control={
                  <Radio
                    sx={{
                      color: "var(--border-color)",
                      "&.Mui-checked": { color: "primary.main" },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: "0.95rem", color: "text.primary" }}
                  >
                    Prepare Now
                  </Typography>
                }
              />
              <FormControlLabel
                value="later"
                control={
                  <Radio
                    sx={{
                      color: "var(--border-color)",
                      "&.Mui-checked": { color: "primary.main" },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{ fontSize: "0.95rem", color: "text.primary" }}
                  >
                    Prepare Later (Delayed Job)
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Delay Minutes Slider (only if Later) */}
          {timeType === "later" && (
            <Box
              className="fade-in"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                mt: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                Delay Minutes:{" "}
                <strong style={{ color: "var(--accent-secondary)" }}>
                  {delayMinutes}m
                </strong>
              </Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={delayMinutes}
                  onChange={(_, val) => setDelayMinutes(val as number)}
                  min={1}
                  max={60}
                  step={1}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 1, label: "1m" },
                    { value: 15, label: "15m" },
                    { value: 30, label: "30m" },
                    { value: 45, label: "45m" },
                    { value: 60, label: "1h" },
                  ]}
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": {
                      boxShadow: "0 0 8px var(--accent-glow)",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 8px rgba(217, 119, 6, 0.16)",
                      },
                    },
                    "& .MuiSlider-markLabel": {
                      color: "text.secondary",
                      fontSize: "0.8rem",
                    },
                    "& .MuiSlider-valueLabel": {
                      backgroundColor: "background.paper",
                      color: "text.primary",
                      border: "1px solid var(--border-color)",
                    },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: "0 4px 14px 0 var(--accent-glow)",
              "&:hover": {
                backgroundColor: "secondary.main",
                boxShadow: "0 6px 20px 0 var(--accent-glow)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Submit Coffee Request"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
