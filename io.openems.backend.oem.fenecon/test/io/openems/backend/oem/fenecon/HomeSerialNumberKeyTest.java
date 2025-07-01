package io.openems.backend.oem.fenecon;

import static io.openems.common.utils.FunctionUtils.apply;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.HashMap;

import org.junit.Test;

import io.openems.backend.oem.fenecon.CreateSerialNumberProtocol.HomeSerialNumberKey;

public class HomeSerialNumberKeyTest {

	@Test
	public void testFromKey() throws Exception {
		assertEquals(new HomeSerialNumberKey(0, 0), HomeSerialNumberKey.from("Tower0Module0SerialNumber"));
		assertEquals(new HomeSerialNumberKey(3, 15), HomeSerialNumberKey.from("Tower3Module15SerialNumber"));
		assertEquals(new HomeSerialNumberKey(98765, 4312),
				HomeSerialNumberKey.from("Tower98765Module4312SerialNumber"));
		assertNull(HomeSerialNumberKey.from("Tower98765ModuleSerialNumber"));
		assertNull(HomeSerialNumberKey.from("TowerModule4312SerialNumber"));
		assertNull(HomeSerialNumberKey.from("Tower0BmsSerialNumber"));
		assertNull(HomeSerialNumberKey.from("SerialNumber"));
	}

	@Test
	public void testFromSerialNumbers() throws Exception {
		var homeSerialNumbers = HomeSerialNumberKey.from(new SerialNumbers(apply(new HashMap<>(), b -> b.put("battery0",
				apply(new HashMap<>(), t -> t.put("Tower0Module0SerialNumber", "1234567890"))))));

		assertEquals(1, homeSerialNumbers.size());
		assertTrue(homeSerialNumbers.containsKey(new HomeSerialNumberKey(0, 0)));
		assertTrue(homeSerialNumbers.containsValue("1234567890"));
	}

	@Test
	public void testFromSerialNumbersPartiallyWrong() throws Exception {
		var homeSerialNumbers = HomeSerialNumberKey
				.from(new SerialNumbers(apply(new HashMap<>(), b -> b.put("battery0", apply(new HashMap<>(), t -> {
					t.put("Tower0Module0SerialNumber", "1234567890");
					t.put("Tower0BmsSerialNumber", "0987654321");
				})))));

		assertEquals(1, homeSerialNumbers.size());
		assertTrue(homeSerialNumbers.containsKey(new HomeSerialNumberKey(0, 0)));
		assertTrue(homeSerialNumbers.containsValue("1234567890"));
	}

	@Test
	public void testFromSerialNumbersWrongComponent() throws Exception {
		var homeSerialNumbers = HomeSerialNumberKey.from(new SerialNumbers(apply(new HashMap<>(), b -> b.put("battery1",
				apply(new HashMap<>(), t -> t.put("Tower0Module0SerialNumber", "1234567890"))))));

		assertTrue(homeSerialNumbers.isEmpty());
	}

	@Test
	public void testFromSerialNumbersWrongChannel() throws Exception {
		var homeSerialNumbers = HomeSerialNumberKey.from(new SerialNumbers(apply(new HashMap<>(),
				b -> b.put("battery0", apply(new HashMap<>(), t -> t.put("Tower0BmsSerialNumber", "1234567890"))))));

		assertTrue(homeSerialNumbers.isEmpty());
	}

}
