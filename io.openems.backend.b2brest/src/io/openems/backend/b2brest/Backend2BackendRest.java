package io.openems.backend.b2brest;

import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import org.eclipse.jetty.ee11.servlet.ServletContextHandler;
import org.eclipse.jetty.server.Server;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.ConfigurationPolicy;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.openems.backend.common.component.AbstractOpenemsBackendComponent;
import io.openems.backend.metrics.prometheus.PrometheusMetrics;
import io.openems.common.exceptions.OpenemsException;

@Designate(ocd = Config.class, factory = true)
@Component(//
		name = "Backend2Backend.Rest", //
		immediate = true, //
		configurationPolicy = ConfigurationPolicy.REQUIRE //
)
public class Backend2BackendRest extends AbstractOpenemsBackendComponent {

	public static final int DEFAULT_PORT = 8075;
	private static final String ID = "b2bRest0";

	private final Logger log = LoggerFactory.getLogger(Backend2BackendRest.class);

	@Reference
	private RestHandler restHandler;
	private final Consumer<ServletContextHandler> contextHandlerChangeSubscription = _ -> {
		this.stopServer();
		this.startServer();
	};

	private int port = DEFAULT_PORT;
	private Server server = null;

	public Backend2BackendRest() {
		super("Backend2Backend.Rest");
	}

	@Activate
	private void activate(Config config) {
		this.port = config.port();
		this.startServer();
		this.restHandler.getContextHandlerSubject().subscribe(this.contextHandlerChangeSubscription);
	}

	@Deactivate
	private void deactivate() {
		this.restHandler.getContextHandlerSubject().unsubscribe(this.contextHandlerChangeSubscription);
		this.stopServer();
	}

	/**
	 * Create and start new server.
	 *
	 * @throws OpenemsException on error
	 */
	private synchronized void startServer() {
		try {
			this.server = new Server(this.port);
			this.server.setRequestLog((request, response) -> {
				this.log.debug("Request: {} {} {}", request.getMethod(), request.getHttpURI(), response.getStatus());

				final var path = request.getHttpURI().getPath();

				PrometheusMetrics.HTTP_REQUEST.labelValues(ID, path)
						.observe(TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - request.getBeginNanoTime()));

				PrometheusMetrics.HTTP_REQUEST_RESULT.labelValues(ID, path, Integer.toString(response.getStatus()))
						.inc();
			});
			this.server.setHandler(this.restHandler.getContextHandlerSubject().getValue());
			this.server.start();
			this.log.info("Backend2Backend.Rest started on port [{}].", this.port);
		} catch (Exception e) {
			this.log.error("Backend2Backend.Rest failed to start on port [{}]: ", this.port, e);
		}
	}

	/**
	 * Stop existing server.
	 */
	private synchronized void stopServer() {
		if (this.server != null) {
			try {
				this.server.stop();
			} catch (Exception e) {
				this.log.warn("Backend2Backend.Rest failed to stop", e);
			}
		}
	}

}
