package io.openems.edge.predictor.load;

import io.openems.edge.common.channel.Doc;

public enum ForecastChannelId implements io.openems.edge.common.channel.ChannelId {
	;
	private final Doc doc;

	private ForecastChannelId(Doc doc) {
		this.doc = doc;
	}

	@Override
	public Doc doc() {
		return this.doc;
	}
}
