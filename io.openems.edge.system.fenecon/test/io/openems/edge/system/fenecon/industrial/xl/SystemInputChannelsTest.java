package io.openems.edge.system.fenecon.industrial.xl;

import static org.junit.Assert.assertTrue;

import java.util.Arrays;

import org.junit.Test;

import io.openems.common.session.Language;

public class SystemInputChannelsTest {

	@Test
	public void testSystemIosDe() {
		assertSystemIosTranslations(Language.DE);
	}

	@Test
	public void testSystemIosEn() {
		assertSystemIosTranslations(Language.EN);
	}

	private static void assertSystemIosTranslations(Language language) {
		var system = new SystemFeneconIndustrialXlImpl();
		final var missingKeys = Arrays.stream(SystemInputChannels.values()) //
				.filter(t -> system.channel(SystemFeneconIndustrialXlImpl.toChannelIdString(t.name()))//
						.channelDoc()//
						.getText(language)//
						.equals(t.getChannelKey())) //
				.map(Enum::name) //
				.toList();
		assertTrue("Missing " + language + " translations for[" + missingKeys.size() + "]: "
				+ String.join(", ", missingKeys), missingKeys.isEmpty());
	}

}
