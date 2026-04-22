import {
  Box,
  H2,
  H4,
  Icon,
  Illustration,
  Label,
  Link,
  Text,
} from "@adminjs/design-system";
import React from "react";

const cardStyle = {
  bg: "white",
  border: "1px solid #E9EDF3",
  borderRadius: "lg",
  boxShadow: "card",
  p: "xl",
};

const Dashboard: React.FC = () => {
  return (
    <Box variant="grey">
      <Box
        style={{
          background:
            "linear-gradient(135deg, #0E1B2E 0%, #123A73 48%, #2A6CB8 100%)",
          borderRadius: 16,
          color: "white",
          marginBottom: 24,
          overflow: "hidden",
          padding: 28,
          position: "relative",
        }}
      >
        <Box style={{ maxWidth: 760, position: "relative", zIndex: 2 }}>
          <Label
            style={{
              backgroundColor: "rgba(255,255,255,0.14)",
              borderRadius: 999,
              color: "#EAF3FF",
              display: "inline-block",
              fontWeight: 700,
              letterSpacing: "0.03em",
              marginBottom: 16,
              padding: "6px 12px",
              textTransform: "uppercase",
            }}
          >
            ToPWR Booths
          </Label>

          <H2 style={{ color: "white", marginBottom: 10 }}>
            Occupancy Control Center
          </H2>
          <Text style={{ color: "#D7E7FF", fontSize: 15, lineHeight: 1.65 }}>
            Manage booths, track occupancy history, and upload booth images from
            one place. Use the quick actions below to add a new booth photo and
            keep localization details up to date.
          </Text>
        </Box>

        <Box
          style={{
            opacity: 0.25,
            position: "absolute",
            right: -48,
            top: -12,
            transform: "scale(1.2)",
            zIndex: 1,
          }}
        >
          <Illustration variant="Rocket" width={240} height={180} />
        </Box>
      </Box>

      <Box
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          marginBottom: 20,
        }}
      >
        <Box style={cardStyle}>
          <H4 style={{ marginBottom: 8 }}>Quick Action: Upload Image</H4>
          <Text color="grey60" style={{ marginBottom: 14 }}>
            Open the Files resource and upload a booth image. Then copy its key
            to `photoKey` in the Booth record.
          </Text>
          <Link href="/admin/resources/file_entries/actions/new">
            <Icon icon="Add" /> Upload New File
          </Link>
        </Box>

        <Box style={cardStyle}>
          <H4 style={{ marginBottom: 8 }}>Booth Management</H4>
          <Text color="grey60" style={{ marginBottom: 14 }}>
            Edit booth names, localization descriptions, and assign photo keys.
          </Text>
          <Link href="/admin/resources/booths">
            <Icon icon="Settings" /> Open Booths
          </Link>
        </Box>

        <Box style={cardStyle}>
          <H4 style={{ marginBottom: 8 }}>Status History</H4>
          <Text color="grey60" style={{ marginBottom: 14 }}>
            Browse all historical occupancy reports sent by devices.
          </Text>
          <Link href="/admin/resources/booth_statuses">
            <Icon icon="Activity" /> Open History
          </Link>
        </Box>
      </Box>

      <Box style={{ ...cardStyle, marginBottom: 16 }}>
        <H4 style={{ marginBottom: 8 }}>Image Upload Endpoint for Admin UI</H4>
        <Text color="grey60" style={{ marginBottom: 8 }}>
          Custom frontend components can upload images through this endpoint
          while logged into AdminJS session:
        </Text>
        <Text
          style={{
            background: "#F5F7FB",
            borderRadius: 8,
            fontFamily: "monospace",
            padding: "8px 10px",
          }}
        >
          POST /admin/upload-image
        </Text>
      </Box>
    </Box>
  );
};

export default Dashboard;
