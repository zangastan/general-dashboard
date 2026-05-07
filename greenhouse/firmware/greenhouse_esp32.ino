#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Configuration
char ssid[] = ":)";
char pass[] = "A1u2G3u4S570";
const char* server_host = "192.168.110.159";
const int   server_port = 3000;
const char* api_path    = "/api/sensor-data";
const char* cmd_path    = "/api/control/pending";

// Serial Configuration
#define RXD2 16
#define TXD2 17
HardwareSerial mySerial(2);

// State Management
char latestPayload[256] = "";
char lastSentPayload[256] = "";
bool hasNewData = false;
unsigned long lastSendTime = 0;
unsigned long lastCommandCheck = 0;
const unsigned long SEND_INTERVAL = 1000; // Send telemetry every 1s for "real-time" feel
const unsigned long CMD_INTERVAL = 1000; // Poll commands every 1s for "real-time" feel

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.printf("[WIFI] Status: %d. Attempting connection to %s...\n", WiFi.status(), ssid);
  WiFi.begin(ssid, pass);
}

void checkCommands() {
  if (millis() - lastCommandCheck < CMD_INTERVAL) return;
  lastCommandCheck = millis();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WIFI] Not connected, skipping command poll.");
    return;
  }

  // Heartbeat log to show activity
  Serial.println("[POLL] Checking for commands...");

  HTTPClient http;
  String url = "http://" + String(server_host) + ":" + String(server_port) + String(cmd_path);
  http.begin(url);
  http.setTimeout(2000);

  int httpCode = http.GET();
  if (httpCode == 200) {
    String payload = http.getString();
    if (payload != "{}" && payload.length() > 2) {
      Serial.printf("[POLL] Command found: %s\n", payload.c_str());
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, payload);
      if (!error) {
        if (doc.containsKey("fan")) {
          bool state = doc["fan"];
          mySerial.println(state ? "FAN_ON" : "FAN_OFF");
          Serial.println(state ? "[COMMAND] Forwarded: FAN_ON" : "[COMMAND] Forwarded: FAN_OFF");
        }
        if (doc.containsKey("pump")) {
          bool state = doc["pump"];
          mySerial.println(state ? "PUMP_ON" : "PUMP_OFF");
          Serial.println(state ? "[COMMAND] Forwarded: PUMP_ON" : "[COMMAND] Forwarded: PUMP_OFF");
        }
      }
    } else {
      // Quiet poll - no command
    }
  } else {
    Serial.printf("[POLL] Error (%d): %s\n", httpCode, http.errorToString(httpCode).c_str());
  }
  http.end();
}

void sendToBackend() {
  if (millis() - lastSendTime < SEND_INTERVAL) return;
  if (!hasNewData && strlen(latestPayload) == 0) return; // Wait for first data

  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = "http://" + String(server_host) + ":" + String(server_port) + String(api_path);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(3000);

  Serial.printf("[HTTP] Sending Telemetry: %s\n", latestPayload);
  int httpCode = http.POST(latestPayload);
  if (httpCode > 0) {
    Serial.printf("[HTTP] POST Success (%d): %s\n", httpCode, http.getString().c_str());
    strcpy(lastSentPayload, latestPayload);
  } else {
    Serial.printf("[HTTP] POST failed, error: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
  lastSendTime = millis();
  hasNewData = false;
}

void setup() {
  Serial.begin(115200);
  mySerial.begin(4800, SERIAL_8N1, RXD2, TXD2);

  Serial.println("\n--- ESP32 GATEWAY STARTING ---");
  connectWiFi();
}

void loop() {
  // WiFi connection maintenance
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastReconnect = 0;
    if (millis() - lastReconnect > 5000) {
      connectWiFi();
      lastReconnect = millis();
    }
  } else {
    static bool wasDisconnected = true;
    if (wasDisconnected) {
      Serial.println("[WIFI] Connected! IP: " + WiFi.localIP().toString());
      wasDisconnected = false;
    }
  }

  // 1. Poll for commands
  checkCommands();

  // 2. Read from Arduino
  static char buffer[256];
  static int bufIdx = 0;
  while (mySerial.available()) {
    char c = mySerial.read();
    if (c == '\n') {
      buffer[bufIdx] = '\0';
      Serial.printf("[ARDUINO] Received line: %s\n", buffer);
      JsonDocument doc;
      DeserializationError error = deserializeJson(doc, buffer);
      if (!error) {
        serializeJson(doc, latestPayload);
        hasNewData = true;
      } else {
        Serial.printf("[ARDUINO] JSON Parse Error: %s\n", error.c_str());
      }
      bufIdx = 0;
    } else if (bufIdx < 255 && c != '\r') {
      buffer[bufIdx++] = c;
    }
  }

  // 3. Send telemetry
  if (hasNewData) {
    sendToBackend();
  }
}