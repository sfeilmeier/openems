package io.openems.backend.b2brest.servlet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Dispatches requests by matching a path against template routes.
 */
public class PathRequestHandler {

	@FunctionalInterface
	public interface Handler {

		/**
		 * Handles the request for a matched route.
		 *
		 * @param pathVariables parsed path variables by variable name
		 * @param req           the servlet request
		 * @param resp          the servlet response
		 */
		void handle(Map<String, String> pathVariables, HttpServletRequest req, HttpServletResponse resp);
	}

	private record Segment(boolean isVariable, String value) {
	}

	private record Route(List<Segment> segments, Handler handler) {
	}

	private final List<Route> routes = new ArrayList<>();

	/**
	 * Registers a route template with its matching handler.
	 *
	 * @param template route template, e.g.
	 *                 {@code /{customer_id}/{contract_id}/feed-limitation}
	 * @param handler  handler for the route
	 */
	public void addRoute(String template, Handler handler) {
		Objects.requireNonNull(handler, "handler");
		this.routes.add(new Route(parseTemplate(template), handler));
	}

	/**
	 * Dispatches a request to the first matching route.
	 *
	 * @param path request path
	 * @param req  servlet request
	 * @param resp servlet response
	 * @return {@code true} if a route matched; else {@code false}
	 * @throws IOException on response write errors
	 */
	public boolean handle(String path, HttpServletRequest req, HttpServletResponse resp) {
		var pathSegments = splitSegments(path);
		for (var route : this.routes) {
			var pathVariables = new LinkedHashMap<String, String>();
			if (this.matches(route.segments(), pathSegments, pathVariables)) {
				route.handler().handle(Collections.unmodifiableMap(pathVariables), req, resp);
				return true;
			}
		}
		return false;
	}

	private static List<Segment> parseTemplate(String template) {
		var segments = splitSegments(template);
		var parsedSegments = new ArrayList<Segment>(segments.size());
		for (var segment : segments) {
			if (segment.startsWith("{") && segment.endsWith("}")) {
				var variableName = segment.substring(1, segment.length() - 1);
				if (variableName.isEmpty()) {
					throw new IllegalArgumentException("Path variable name must not be empty in template: " + template);
				}
				parsedSegments.add(new Segment(true, variableName));
			} else {
				parsedSegments.add(new Segment(false, segment));
			}
		}
		return parsedSegments;
	}

	private boolean matches(List<Segment> templateSegments, List<String> pathSegments,
			Map<String, String> pathVariables) {
		if (templateSegments.size() != pathSegments.size()) {
			return false;
		}
		for (int i = 0; i < templateSegments.size(); i++) {
			var templateSegment = templateSegments.get(i);
			var pathSegment = pathSegments.get(i);
			if (!templateSegment.isVariable()) {
				if (!templateSegment.value().equals(pathSegment)) {
					return false;
				}
				continue;
			}
			pathVariables.put(templateSegment.value(), pathSegment);
		}
		return true;
	}

	private static List<String> splitSegments(String path) {
		if (path == null || path.isBlank()) {
			return List.of();
		}
		var split = path.split("/");
		var segments = new ArrayList<String>(split.length);
		for (var segment : split) {
			if (!segment.isEmpty()) {
				segments.add(segment);
			}
		}
		return segments;
	}

}
