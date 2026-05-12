package io.openems.edge.app.systembase;

import static io.openems.edge.app.common.props.CommonProps.alias;

import java.util.Map;
import java.util.function.Function;

import org.osgi.service.cm.ConfigurationAdmin;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.google.gson.JsonElement;

import io.openems.common.exceptions.OpenemsError.OpenemsNamedException;
import io.openems.common.function.ThrowingTriFunction;
import io.openems.common.session.Language;
import io.openems.common.session.Role;
import io.openems.edge.app.systembase.Ixl010Network.Property;
import io.openems.edge.common.component.ComponentManager;
import io.openems.edge.core.appmanager.AbstractOpenemsApp;
import io.openems.edge.core.appmanager.AbstractOpenemsAppWithProps;
import io.openems.edge.core.appmanager.AppConfiguration;
import io.openems.edge.core.appmanager.AppDef;
import io.openems.edge.core.appmanager.AppManagerUtil;
import io.openems.edge.core.appmanager.ComponentUtil;
import io.openems.edge.core.appmanager.ConfigurationTarget;
import io.openems.edge.core.appmanager.InterfaceConfiguration;
import io.openems.edge.core.appmanager.OpenemsApp;
import io.openems.edge.core.appmanager.OpenemsAppCardinality;
import io.openems.edge.core.appmanager.OpenemsAppCategory;
import io.openems.edge.core.appmanager.OpenemsAppPermissions;
import io.openems.edge.core.appmanager.Type;
import io.openems.edge.core.appmanager.Type.Parameter.BundleParameter;
import io.openems.edge.core.appmanager.dependency.Tasks;
import io.openems.edge.core.host.Routes;

@Component(name = "App.SystemBase.Industrial.Xl.IXL010")
public class Ixl010Network extends AbstractOpenemsAppWithProps<Ixl010Network, Property, BundleParameter>
		implements OpenemsApp {

	public enum Property implements Type<Property, Ixl010Network, BundleParameter> {
		ALIAS(alias()) //
		;

		private final AppDef<? super Ixl010Network, ? super Property, ? super BundleParameter> def;

		private Property(AppDef<? super Ixl010Network, ? super Property, ? super BundleParameter> def) {
			this.def = def;
		}

		@Override
		public Type<Property, Ixl010Network, BundleParameter> self() {
			return this;
		}

		@Override
		public AppDef<? super Ixl010Network, ? super Property, ? super BundleParameter> def() {
			return this.def;
		}

		@Override
		public Function<GetParameterValues<Ixl010Network>, BundleParameter> getParamter() {
			return Parameter.functionOf(AbstractOpenemsApp::getTranslationBundle);
		}

	}

	@Activate
	public Ixl010Network(//
			@Reference final ComponentManager componentManager, //
			final ComponentContext componentContext, //
			@Reference final ConfigurationAdmin cm, //
			@Reference final ComponentUtil componentUtil, //
			@Reference final AppManagerUtil appManagerUtil //
	) {
		super(componentManager, componentContext, cm, componentUtil);
	}

	@Override
	public OpenemsAppCategory[] getCategories() {
		return new OpenemsAppCategory[] { OpenemsAppCategory.SYSTEM_BASE };
	}

	@Override
	public OpenemsAppCardinality getCardinality() {
		return OpenemsAppCardinality.SINGLE_IN_CATEGORY;
	}

	@Override
	protected Ixl010Network getApp() {
		return this;
	}

	@Override
	protected ThrowingTriFunction<ConfigurationTarget, Map<Property, JsonElement>, Language, AppConfiguration, OpenemsNamedException> appPropertyConfigurationFactory() {
		return (t, p, l) -> {
			return AppConfiguration.create()//
					.addTask(Tasks.staticIp(//
							new InterfaceConfiguration("eth1")//
									.setDhcp(false)//
									.addIp("172.23.21.1/24")//
									.addRoute(Routes.builder()//
											.setRouteGateway("172.23.21.254")//
											.setRouteDestination("172.23.22.0/24")//
											.setRouteGatewayOnLink(true)//
											.build())//
									.addRoute(Routes.builder()//
											.setRouteGateway("172.23.21.254")//
											.setRouteDestination("172.23.23.0/24")//
											.setRouteGatewayOnLink(true)//
											.build())//
									.addRoute(Routes.builder()//
											.setRouteGateway("172.23.21.254")//
											.setRouteDestination("172.23.24.0/24")//
											.setRouteGatewayOnLink(true)//
											.build()), //
							new InterfaceConfiguration("eth2")//
									.setCreateIfNotExist(true)//
									.setDhcp(false)//
									.addIp("172.25.21.1/24"), //
							new InterfaceConfiguration("eth0")//
									.setDhcp(false)//
									.addIp("172.23.20.1/24")//
									.setGatewayOnLink(true)//
									.setGateway("172.23.20.254") //

			))//
					.build();
		};
	}

	@Override
	public OpenemsAppPermissions getAppPermissions() {
		return OpenemsAppPermissions.create() //
				.setCanSee(Role.ADMIN) //
				.setCanDelete(Role.ADMIN) //
				.build();
	}

	@Override
	protected Property[] propertyValues() {
		return Property.values();
	}

}