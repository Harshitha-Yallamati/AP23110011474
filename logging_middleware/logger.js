const axios = require("axios");

const LOG_URL = "http://20.207.122.201/evaluation-service/logs";
const TOKEN = process.env.AUTH_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJoYXJzaGl0aGF5MjI1QGdtYWlsLmNvbSIsImV4cCI6MTc3NzcwMjg2MywiaWF0IjoxNzc3NzAxOTYzLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMjhhMjg4ODktZDU1YS00OTMwLWJhMGQtNjJiNzg5NmI5NmJjIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiaGFyc2hpdGhhIHlhbGxhbWF0aSIsInN1YiI6ImJiNDQ4MDc0LTEzMWUtNGZkNi1hOTg4LWMzZjY1ZTUzYzE1NSJ9LCJlbWFpbCI6ImhhcnNoaXRoYXkyMjVAZ21haWwuY29tIiwibmFtZSI6ImhhcnNoaXRoYSB5YWxsYW1hdGkiLCJyb2xsTm8iOiJhcDIzMTEwMDExNDc0aCIsImFjY2Vzc0NvZGUiOiJRa2JweEgiLCJjbGllbnRJRCI6ImJiNDQ4MDc0LTEzMWUtNGZkNi1hOTg4LWMzZjY1ZTUzYzE1NSIsImNsaWVudFNlY3JldCI6InJQVUFXUkt2WE55VEFLQ3YifQ.TxjyXbc1JNFRsCeVCQodlrykQU5X7Tf78YSDp20eLTc";

async function Log(stack, level, package, message) {
  try {
    const response = await axios.post(
      LOG_URL,
      {
        stack,
        level,
        package,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Logging failed:", error.response?.data || error.message);
    return null;
  }
}

module.exports = Log;
