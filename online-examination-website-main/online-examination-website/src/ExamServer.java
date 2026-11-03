import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

public class ExamServer {
    private static final int PORT = 8081;
    private static final Path WEB_ROOT = Path.of("web").toAbsolutePath();

    // Correct options for the five questions displayed in app.js.
    private static final String[] ANSWERS = {"A", "B", "C", "D", "A"};

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/submit", ExamServer::handleSubmission);
        server.createContext("/", ExamServer::serveStaticFiles);
        server.setExecutor(null);
        server.start();
        System.out.println("Online Examination Website is running.");
        System.out.println("Open http://localhost:" + PORT + " in your browser.");
    }

    private static void handleSubmission(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendText(exchange, 405, "Method not allowed");
            return;
        }

        String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
        Map<String, String> form = parseForm(body);
        String name = form.getOrDefault("name", "Student");
        String roll = form.getOrDefault("roll", "-");

        int score = 0;
        for (int i = 0; i < ANSWERS.length; i++) {
            String selected = form.getOrDefault("q" + (i + 1), "");
            if (ANSWERS[i].equalsIgnoreCase(selected)) {
                score++;
            }
        }

        String json = "{\"name\":\"" + escapeJson(name) + "\","
                + "\"roll\":\"" + escapeJson(roll) + "\","
                + "\"score\":" + score + ","
                + "\"total\":" + ANSWERS.length + "}";
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        byte[] response = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(200, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }

    private static Map<String, String> parseForm(String body) {
        Map<String, String> values = new HashMap<>();
        for (String pair : body.split("&")) {
            String[] parts = pair.split("=", 2);
            String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String value = parts.length > 1
                    ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
            values.put(key, value);
        }
        return values;
    }

    private static void serveStaticFiles(HttpExchange exchange) throws IOException {
        if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            sendText(exchange, 405, "Method not allowed");
            return;
        }

        String requested = exchange.getRequestURI().getPath();
        if (requested.equals("/")) requested = "/index.html";
        Path file = WEB_ROOT.resolve(requested.substring(1)).normalize();

        // Prevent requests from escaping the web directory.
        if (!file.startsWith(WEB_ROOT) || !Files.isRegularFile(file)) {
            sendText(exchange, 404, "File not found");
            return;
        }

        String contentType = requested.endsWith(".css") ? "text/css; charset=UTF-8"
                : requested.endsWith(".js") ? "application/javascript; charset=UTF-8"
                : "text/html; charset=UTF-8";
        byte[] data = Files.readAllBytes(file);
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.sendResponseHeaders(200, data.length);
        exchange.getResponseBody().write(data);
        exchange.close();
    }

    private static void sendText(HttpExchange exchange, int status, String message)
            throws IOException {
        byte[] data = message.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, data.length);
        exchange.getResponseBody().write(data);
        exchange.close();
    }

    private static String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\n", "\\n").replace("\r", "\\r");
    }
}
