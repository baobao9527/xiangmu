/*
 * Copyright © 2015-2016, AnHui Mobiao technology co. LTD Inc. All Rights Reserved.
 */

package app.models.sys;

import com.mo008.crdm.models.car.CarGps;
import com.mo008.crdm.models.car.CarInfo;
import com.mo008.crdm.models.car.Fence;
import com.mo008.crdm.models.device.DeviceDataHistory;
import com.mo008.services.DeviceDataService;
import com.mo008.util.GpsUtil;

import goja.Goja;
import goja.test.ModelTestCase;
import com.jfinal.plugin.redis.RedisPlugin;

import org.apache.commons.lang3.RandomStringUtils;
import org.joda.time.DateTime;
import org.junit.Test;

import java.math.BigDecimal;

/**
 * <p> </p>
 *
 * @author BOGON
 * @version 1.0
 * @since JDK 1.6
 */
public class AllTest extends ModelTestCase {
    @Test
    public void testFindByLevel() throws Exception {
        CarInfo car;
        for (int i = 0; i < 100; i++) {
            car = new CarInfo();
            car.setAgent("代理商");
//            car.setAreaId(1);
            car.setCarDischargeStandard("a");
            car.setCarFlag("A");
            car.setCarFrameworkNo(DateTime.now().toString("yyyyMMddHHmmss")+ RandomStringUtils.randomAlphabetic(4).toLowerCase());
            car.setCarModel(DateTime.now().toString("yyyyMMddHHmmss")+RandomStringUtils.randomAlphabetic(4).toLowerCase());
            car.setCarNo("皖"+RandomStringUtils.randomAlphabetic(1).toUpperCase()+RandomStringUtils.randomNumeric(5));
            car.setCarNoColor(1);
            car.setDriverId(i+1);
            car.setDeviceId(Long.valueOf(i+1));
            car.setCreateTime(DateTime.now().toDate());
            car.setEngineDischargeValue(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            car.setInitalH2O2Value(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            car.setWheelPower(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            car.setInitalSmoke80Value(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            car.setInitalSmoke90Value(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            car.setInitalSmoke100Value(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            car.setDisplayFlag(1);
            car.save();
        }
    }

    @Test
    public void testAdd() throws Exception{

        DeviceDataHistory deviceData;
        for (int i = 0; i < 100; i++) {
            deviceData = new DeviceDataHistory();
            deviceData.setAfterKm(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setCuron(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setDeviceId(2);
            deviceData.setDpfArterTemperature(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setDpfBeforeTemperature(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setEngineLoad(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setEngineSpeed(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setFwhVersion("aaa");
            deviceData.setNox(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setObd(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setPressure(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setReportTime(DateTime.now().toDate());
            deviceData.setSoftwareVersion("1111");
            deviceData.setSpeed(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setTemperature1(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setTemperature2(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setTemperature3(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setTemperature4(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setTorque(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setUreaPosition(new BigDecimal(RandomStringUtils.randomNumeric(2)));
            deviceData.setUreaTemperature(new BigDecimal(RandomStringUtils.randomNumeric(2)));

            deviceData.setFlagMileage(aaa());
            deviceData.setFlagSpeed(aaa());
            deviceData.setTemperature1Flag(aaa());
            deviceData.setTemperature2Flag(aaa());
            deviceData.setTemperature3Flag(aaa());
            deviceData.setTemperature4Flag(aaa());
            deviceData.setUreaPositionFlag(aaa());
            deviceData.setUreaTemperatureFlag(aaa());
            deviceData.save();
        }
    }

    public static int aaa(){
        BigDecimal tmp =new BigDecimal(RandomStringUtils.randomNumeric(1));
        while (tmp.intValue()>2){
            tmp =new BigDecimal(RandomStringUtils.randomNumeric(1));
        }
        return tmp.intValue();
    }

    @Test
    public void addGPS() throws Exception{
        String[] gps =new String[]{ "117.383524,31.896579","117.365665,31.891275","117.358335,31.899736","117.114391,31.99086","116.388833,39.993868"
                ,"116.386677,39.972085","116.105399,39.979052","116.496342,39.876802","116.104824,40.003817","116.610175,40.025479","116.522213,39.745999",
                "113.530353,32.777176","112.941639,33.249948","118.163597,33.904444","117.878439,33.769144","118.333772,33.92889","118.28088,33.831543"
                ,"121.480381,31.273967","121.533992,31.309638","121.52968,31.262361","121.650125,31.309515","121.523068,31.305936","121.544771,31.268287","116.996138,31.949875"
                ,"117.004906,31.885511","117.121614,31.929528","117.015398,31.956002","116.968974,31.95784","117.02201,31.880973","117.08644,30.565449"
                ,"117.119857,30.570984","117.066246,30.579006","117.08644,30.582115","117.058126,30.55724","117.089171,30.550709","117.105197,30.549776","117.117055,30.568497"
                ,"117.125894,30.579006","117.06833,30.581804","117.081841,30.57173","117.026721,30.579441","117.237459,31.79287","117.203252,31.808215","117.290208,31.819752"
                ,"107.408128,32.992854","107.891632,33.002059","107.444348,33.053397","110.62823,31.757016","110.958807,31.737855","110.499449,31.816438",
                "113.048625,32.70069","113.004931,32.595624","112.771515,32.576153","112.902021,32.6579","112.382872,32.706037","112.870401,32.685132"
                ,"112.493831,32.684646","112.748519,32.487997","112.36505,32.54694"};
        CarGps carGps;
        for (int i = 0; i < 59; i++) {
            carGps = new CarGps();
            carGps.setCreateTime(DateTime.now().toDate());
            carGps.setBaiduLongitude(Double.parseDouble(gps[i].split(",")[0]));//百度经度
            carGps.setBaiduLatitude(Double.parseDouble(gps[i].split(",")[1]));//百度纬度
            carGps.setDeviceId(i+1);
            carGps.setCreateDate(DateTime.now().toDate());
            carGps.setGpsLatitude("1");//经度
            carGps.setGpsLongitude("1");//纬度
            carGps.getTimestamp(DateTime.now().getMillis()/100+"");
            carGps.save();
        }

    }

    public static void main(String[] args){
        String[] gps =new String[]{ "117.383524,31.896579","117.365665,31.891275","117.358335,31.899736","117.114391,31.99086","116.388833,39.993868"
                ,"116.386677,39.972085","116.105399,39.979052","116.496342,39.876802","116.104824,40.003817","116.610175,40.025479","116.522213,39.745999",
                "113.530353,32.777176","112.941639,33.249948","118.163597,33.904444","117.878439,33.769144","118.333772,33.92889","118.28088,33.831543"
                ,"121.480381,31.273967","121.533992,31.309638","121.52968,31.262361","121.650125,31.309515","121.523068,31.305936","121.544771,31.268287","116.996138,31.949875"
                ,"117.004906,31.885511","117.121614,31.929528","117.015398,31.956002","116.968974,31.95784","117.02201,31.880973","117.08644,30.565449"
                ,"117.119857,30.570984","117.066246,30.579006","117.08644,30.582115","117.058126,30.55724","117.089171,30.550709","117.105197,30.549776","117.117055,30.568497"
                ,"117.125894,30.579006","117.06833,30.581804","117.081841,30.57173","117.026721,30.579441","117.237459,31.79287","117.203252,31.808215","117.290208,31.819752"
                ,"107.408128,32.992854","107.891632,33.002059","107.444348,33.053397","110.62823,31.757016","110.958807,31.737855","110.499449,31.816438",
                "113.048625,32.70069","113.004931,32.595624","112.771515,32.576153","112.902021,32.6579","112.382872,32.706037","112.870401,32.685132"
                ,"112.493831,32.684646","112.748519,32.487997","112.36505,32.54694"};
        System.out.printf(gps.length+"");

        System.out.println(DateTime.parse("2014-05-05 23:00:00"));
    }

    @Test
    public void bbbb(){
        RedisPlugin redisPlugin = new RedisPlugin("main", Goja.configuration.getProperty("redis.host"),7159);
        redisPlugin.start();
        DeviceDataService.getInstance().deal();
    }

    @Test
    public void aaaa(){
        Fence fence = GpsUtil.isPointInFence(114.324835,30.532047);
        System.out.printf("f"+fence);
    }


}
