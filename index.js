var Price = 2000;
const { count } = require('console');
var fs = require('fs');
var Crashes = 0;
var Lucks = 0;
var CrashTicks = 0;
var LuckTicks = 0;
var IsBullrun = false;
var IsCrashing = false;
var BiggestJump = 0;
var BiggestFall = 0;
var Prices = Array();
Prices.push(2000);

// Config
var Config = {
    "TimeBetweenTicks": 1,
    "Trend": {
        "Target": 2000,
        "Above": {
            "Chance": 50,
            "Add": {
                "Min": 0,
                "Max": 12,
            },
            "Sub": {
                "Min": 0,
                "Max": 9,
            }
        },
        "Below": {
            "Chance": 60,
            "Add": {
                "Min": 0,
                "Max": 8,
            },
            "Sub": {
                "Min": 0,
                "Max": 6,
            }
        }
    },

    "Bullrun": {
        "StartChance": 3,
        "EndChance": 10,
        "Modifier": 4,
        "TargetChange": {"Min": 100, "Max": 500},
    },

    "Crash": {
        "StartChance": 2,
        "EndChance": 5,
        "Modifier": 10,
        "TargetChange": {"Min": 100, "Max": 500},
    },
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
function getRndFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function PriceChance()
{
    var LastPrice = Price;

    // Natural Trend
    var TrendChance = getRndInteger(0, 100);
    var Trend = null;

    if (Price >= Config.Trend.Target) { Trend = Config.Trend.Above; } else { Trend = Config.Trend.Below; }

    if (TrendChance < Trend.Chance)
    {
        Price += getRndInteger(Trend.Add.Min, Trend.Add.Max);
    }
    else
    {
        Price -= getRndInteger(Trend.Sub.Min, Trend.Sub.Max);
    }

    // Bullrun & Crash Chances
    if (IsBullrun == false && IsCrashing == false)
    {
        var BullrunChance = getRndInteger(0, 10000);
        var CrashChance = getRndInteger(0, 10000);
    
        if (BullrunChance < Config.Bullrun.StartChance)
        {
            IsBullrun = true;
            Lucks++;
            Config.Trend.Target += getRndInteger(Config.Bullrun.TargetChange.Min, Config.Bullrun.TargetChange.Max);
        }

        if (IsBullrun == false && CrashChance < Config.Crash.StartChance)
        {
            IsCrashing = true;
            Crashes++;
            Config.Trend.Target -= getRndInteger(Config.Crash.TargetChange.Min, Config.Crash.TargetChange.Max);
        }
    }

    // Bullrun
    if (IsBullrun == true)
    {
        var BullrunChance = getRndInteger(0, 500);

        if (BullrunChance < Config.Bullrun.EndChance)
        {
            IsBullrun = false;
        }
        else
        {
            Price += getRndInteger(Config.Trend.Below.Add.Min * Config.Bullrun.Modifier, Config.Trend.Below.Add.Max * Config.Bullrun.Modifier);
            LuckTicks++;
        }
    }

    // Crash
    if (IsCrashing == true)
    {
        var CrashChance = getRndInteger(0, 500);

        if (CrashChance < Config.Crash.EndChance)
        {
            IsCrashing = false;
        }
        else
        {
            Price -= getRndInteger(Config.Trend.Above.Sub.Min * Config.Crash.Modifier, Config.Trend.Above.Sub.Max * Config.Crash.Modifier);
            CrashTicks++;
        }
    }

    // Floor Price
    if (Price < 1)
    {
        Price = 1;
    }

    // Floor Target
    if (Config.Trend.Target < 1) { Config.Trend.Target = 1; }

    // Update Stats
    if ((LastPrice - Price) > BiggestJump)
    {
        BiggestJump = LastPrice - Price;
    }
    if ((Price - LastPrice) > BiggestFall)
    {
        BiggestFall = Price - LastPrice;
    }

    // Update Prices
    Prices.push(Price);

    // Return
    return Price;
}

function GetPercent(Value, Total)
{
    return ((Value / Total) * 100).toString() + "%";
}

function GetAverage(Array)
{
    var Total = 0;

    for (var i = 0; i < Array.length; i++)
    {
        Total += Array[i];
    }

    return Total / Array.length;
}

var PriceDivier = 1;
function GetPriceDivider()
{
    PriceDivier += getRndFloat(-0.1, 0.1);
    if (PriceDivier <= 0) { PriceDivier = 0.01; }
    return PriceDivier;
}

function GetDifficulty(Price)
{
    var Diff = ((Price * GetPriceDivider()) * 0.0005) + (Math.random() / 10);
    var SDiff = Diff.toString();
    var SDiff = SDiff.substring(0, SDiff.indexOf(".") + 3);
    return SDiff;
}

function Simulate(Days)
{
    fs.writeFileSync("price.txt", "");
    fs.writeFileSync("difficulty.txt", "");
    fs.writeFileSync("days.txt", "");
    var String = Price.toString();
    var String2 = GetDifficulty(Price);
    var String3 = "1";
    var Count = (Days * 1440) / Config.TimeBetweenTicks;

    for (var i = 0; i < Count; i++)
    {
        var price = PriceChance();
        String += "\n" + price.toString();
        String2 += "\n" + GetDifficulty(Price);
        String3 += "\n" + Math.floor(i / (1440 / Config.TimeBetweenTicks) + 1);
    }

    fs.writeFileSync("price.txt", String);
    fs.writeFileSync("difficulty.txt", String2);
    fs.writeFileSync("days.txt", String3);

    console.log("Crashes: " + Crashes + " / " + GetPercent(Crashes, Count));
    console.log("Lucks: " + Lucks + " / " + GetPercent(Lucks, Count));
    console.log("Crash Ticks: " + CrashTicks);
    console.log("Luck Ticks: " + LuckTicks);
    console.log("Length: " + (Count * Config.TimeBetweenTicks) / 1440);
    console.log("Biggest Jump: " + BiggestJump);
    console.log("Biggest Fall: " + BiggestFall);
    console.log("Average Price: " + GetAverage(Prices));
    console.log("Count: " + Count);
}

Simulate(30);