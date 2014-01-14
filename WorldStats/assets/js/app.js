/// <reference path="config.js" />
/// <reference path="../../i18n/en/resources.js" />
var WorldStats = WorldStats || {};

// create a general purpose namespace method
// this will allow us to create namespace a bit easier
WorldStats.createNS = function (namespace) {
    var nsparts = namespace.split(".");
    var parent = WorldStats;

    // we want to be able to include or exclude the root namespace 
    // So we strip it if it's in the namespace
    if (nsparts[0] === "WorldStats") {
        nsparts = nsparts.slice(1);
    }

    // loop through the parts and create 
    // a nested namespace if necessary
    for (var i = 0; i < nsparts.length; i++) {
        var partname = nsparts[i];
        // check if the current parent already has 
        // the namespace declared, if not create it
        if (typeof parent[partname] === "undefined") {
            parent[partname] = {};
        }
        // get a reference to the deepest element 
        // in the hierarchy so far
        parent = parent[partname];
    }
    // the parent is now completely constructed 
    // with empty namespaces and can be used.
    return parent;
};

// Define application helper module
WorldStats.createNS("WorldStats.Helpers");

WorldStats.Helpers.LoadIndicator = function (element, text) {
    var htmlTemplate = "<div class='overlay'>${text}</div>";
    this.overlaySelector = ".overlay";
    this.element = "#" + element;
    if ($([this.element, this.overlaySelector].join(" ")).length === 0) {
        $(this.element).addClass("relative");
        text = text || WorldStats.Resources.Helpers.LoadIndicator.Text;
        $(this.element).append($.ig.tmpl(htmlTemplate, {
            text: text
        }));
    }
};

WorldStats.Helpers.LoadIndicator.prototype = function () {
    var destroy = function (thisObj, callback) {
        $([thisObj.element, thisObj.overlaySelector].join(" ")).remove();
        $(thisObj.element).removeClass("relative");

        if (callback) {
            callback();
        }
    };

    var destroyWhenTheComponentsAreLoaded = function (components, callback) {
        var that = this, isThereAnyComponentLeft = components.map(function (item) {
            return $([item.selector, item.className].join("")).length === 1;
        }).filter(function (item) {
            return item === false;
        });

        if (isThereAnyComponentLeft.length > 0) {
            setTimeout(function () {
                destroyWhenTheComponentsAreLoaded.call(that, components, callback);
            }, 100);
        } else {
            destroy(this, callback);
        }
    };
    return {
        destroyWhenTheComponentsAreLoaded: destroyWhenTheComponentsAreLoaded
    }
}();

WorldStats.Helpers.loadResources = function (resources) {
    // private variables
    var instance;

    // private methods
    var init = function () {
        var deferreds = GetResourcesDeferredData();

        return $.when.apply(null, deferreds);
    };

    function GetResourcesDeferredData() {
        var deferreds = [],
            pathToResources = null,
            i = 0;

        for (i = 0; i < resources.length; i++) {
            pathToResources = [
               resources[i].folder,
               WorldStats.config.language,
               resources[i].file
            ].join("/");

            deferreds.push(
                $.getScript(pathToResources)
            );
        }

        return deferreds;
    }

    if (!instance) {
        instance = init();
    }

    return instance;
};

WorldStats.Helpers.messageForSupportedWidth = function (element) {
    // private variables
    var instance;

    // private methods
    var init = function () {
        element.append("<div class='unsupportedDeviceWidth'><img src='assets/images/logo-big.png'/><p>" +
           WorldStats.Resources.General.MessageForSupportedWidth +
       "</p></div>");
    };

    if (!instance) {
        instance = init();
    }

    return instance;
};

WorldStats.Helpers.bubble = function () {
    // private variables
    var instance;

    // private methods
    var init = function () {

    };

    var drawBubbleRectangle = function (context, brush, outline, center, size) {
        var lineWidth = 4.0;

        context.fillStyle = brush;
        context.strokeStyle = outline;
        context.lineWidth = lineWidth;
        context.beginPath();

        context.fillRect(center.X, center.Y, size, size);

        context.fill();
        context.stroke();
        context.closePath();
    };

    var drawTextInBubble = function (context, code, center, size, fontSize) {
        var textBaseline = "middle",
            textAlign = "center",
            fontSize = fontSize || "10px",
            font = fontSize + " arial",
            fillStyle = "white";

        context.textBaseline = textBaseline;
        context.textAlign = textAlign;
        context.font = font;
        context.fillStyle = fillStyle;

        context.fillText(code, center.X, center.Y);
    };

    var getBubbleSize = function (maxSize, item, indicator, indicatorIsLogarithmic) {
        var normalizedValue = 0,
            size = 0;

        if (item == null) {
            return size;
        }

        normalizedValue = (item.value4 - indicator.minimum) / (indicator.maximum - indicator.minimum);
        normalizedValue = Math.max(Math.min(normalizedValue, 1), 0);

        if (isNaN(normalizedValue) || !isFinite(normalizedValue)) {
            return size;
        } else {
            size = maxSize * (1.1 + 0.6 * (indicatorIsLogarithmic ? Math.log(1.0 + (Math.E - 1.0) * normalizedValue) : normalizedValue));
            return size;
        }
    };

    var cacheBubblesAtCanvas = function (element, width, height, isVisible) {
        var markerObj = $("<canvas id='" + element + "'></canvas>");

        markerObj.attr("width", width);
        markerObj.attr("height", height);

        if (isVisible) {
            markerObj.css({ "margin-top": -800 });
            $("body").append(markerObj);
        }

        return markerObj[0];
    };

    if (!instance) {
        instance = init();
    }

    // public API
    return {
        drawBubbleRectangle: drawBubbleRectangle,
        drawTextInBubble: drawTextInBubble,
        getBubbleSize: getBubbleSize,
        cacheBubblesAtCanvas: cacheBubblesAtCanvas,
    };
};

WorldStats.Helpers.bubbleRendering = function () {
    // private variables
    var instance;

    // private methods
    var init = function () {

    };

    var fastRender = function (renderInfo, markersPerRow, markerCanvas, markerMaxSize, markerHalfMaxSize) {
        var ctx = renderInfo.context,
            destLeft = renderInfo.xPosition - (renderInfo.availableWidth / 2.0),
            destTop = renderInfo.yPosition - (renderInfo.availableHeight / 2.0),
            top,
            left;

        if (renderInfo.isHitTestRender) {
            if (ctx.fillStyle != renderInfo.data.actualItemBrush().fill()) {
                ctx.fillStyle = renderInfo.data.actualItemBrush().fill();
            }

            ctx.fillRect(destLeft,
                    destTop,
                    renderInfo.availableWidth,
                    renderInfo.availableHeight);
        } else if (renderInfo.data.item() !== null) {
            top = Math.floor(renderInfo.data.item().index / markersPerRow) * markerMaxSize;
            left = (renderInfo.data.item().index % markersPerRow) * markerMaxSize;

            ctx.drawImage(markerCanvas,
                    left, top,
                    markerMaxSize, markerMaxSize,
                    destLeft, destTop,
                    renderInfo.availableWidth,
                    renderInfo.availableHeight);
        }
    };

    var qualityRender = function (renderInfo, qualityRenderParameters) {

        var ctx = renderInfo.context,
            size = qualityRenderParameters.bubbleHelper.getBubbleSize(qualityRenderParameters.maxSize,
                    renderInfo.data.item(),
                    qualityRenderParameters.indicator4,
                    qualityRenderParameters.indicator4IsLogarithmic),
            fontSize = size / 2.0,
            brush,
            brushes,
            ouline;

        brushes = WorldStats.Helpers.getBrushes();

        if (renderInfo.isHitTestRender) {
            if (ctx.fillStyle != renderInfo.data.actualItemBrush().fill()) {
                ctx.fillStyle = renderInfo.data.actualItemBrush().fill();
            }
            ctx.fillRect(renderInfo.xPosition - (renderInfo.availableWidth / 2.0),
                renderInfo.yPosition - (renderInfo.availableHeight / 2.0),
                renderInfo.availableWidth,
                renderInfo.availableHeight);
        } else if (renderInfo.data.item() !== null) {
            if (ctx.fillStyle != renderInfo.data.actualItemBrush().fill()) {
                var country = renderInfo.data._item;
                brush = brushes[qualityRenderParameters.countries.getRegionIndex()[country.regionType]];
                outline = renderInfo.data.outline().fill();
            }

            qualityRenderParameters.bubbleHelper.drawBubbleRectangle(ctx, brush, outline, {
                X: renderInfo.xPosition - (renderInfo.availableWidth / 2.0),
                Y: renderInfo.yPosition - (renderInfo.availableHeight / 2.0)
            },
            size);
        }

        if (!renderInfo.isHitTestRender && fontSize > 0) {
            qualityRenderParameters.bubbleHelper.drawTextInBubble(ctx, renderInfo.data.item().code, {
                X: renderInfo.xPosition,
                Y: renderInfo.yPosition
            },
            size,
            Math.round(fontSize));
        }
    };

    if (!instance) {
        instance = init();
    }

    // public API
    return {
        fastRender: fastRender,
        qualityRender: qualityRender
    };

};

WorldStats.Helpers.numberFormatter = function (number) {
    var base = Math.floor(Math.log(Math.abs(number)) / Math.log(1000));
    if (base > 0 && base < 4) {
        var number = Math.round(number / Math.pow(1000, base));
        number += " KMB"[base];
    }
    return number;
};

WorldStats.Helpers.openDialog = function (id, msg) {

    //$("body").append("<div id='" + id + "' style='display:none;'>" +
    //    msg +
    //"</div>");

    //$("#" + id).igDialog({
    //    state: "opened",
    //    modal: true,
    //    draggable: false,
    //    resizable: false
    //});

    var selectionRestriction = $('.selectionRestriction').addClass('selectionRestrictionAnim');
    setTimeout(function () {
        selectionRestriction.removeClass('selectionRestrictionAnim');
    }, 500);

}

WorldStats.Helpers.openTrendChartHint = function () {
    var msg = WorldStats.Resources.General.SelectCountriesOnTheLeft;
    $(".selectedCharts").append("<div class= 'hintContainer' style='display:block;'>" +
    msg +
    "</div>");

    $(".selectedCharts").append("<div class= 'hintOverlay' style='display:block;'></div>");
}

WorldStats.Helpers.closeTrendChartHint = function () {
    $(".hintOverlay").css("display", "none");
    $(".hintContainer").css("display", "none");
}

WorldStats.Helpers.getBrushes = function () {
    return brushes = [
                    "#ba132f",
                    "#ed9b03",
                    "#ec6c2b",
                    "#c02841",
                    "#594a9f",
                    "#1a6ac4",
                    "#8a9b0f"
    ];
}

WorldStats.Helpers.getOutlines = function () {
    return outlines = [
        "#2380A8",
        "#333",
        "#808080",
        "#185170",
        "#879922",
        "#FBA609",
        "#8856b1",
        "#e3720c",
        "#582c7d",
        "#582c7d",
        "#386a23",
        "#C62D36"
    ];
};

// Sorts alphabeticly the countries and the corresponding indicators by country displayName
WorldStats.Helpers.sortWorldData = function () {

    Array.prototype.swap = function (a, b) {
        var tmp = this[a];
        this[a] = this[b];
        this[b] = tmp;
    };

    var partition = function (array, begin, end, pivot) {
        var piv = array[pivot],
            indicatorsLen = worldData.indicators.length,
            i;

        array.swap(pivot, end - 1);

        for (i = 0; i < indicatorsLen; i++) {
            // Swap the data in the indicators too
            worldData.indicators[i].fullData.swap(pivot, end - 1);
        }

        var store = begin;
        var ix;
        for (ix = begin; ix < end - 1; ++ix) {
            if (array[ix].displayName <= piv.displayName) {
                array.swap(store, ix);

                for (i = 0; i < indicatorsLen; i++) {
                    // Swap the data in the indicators too
                    worldData.indicators[i].fullData.swap(store, ix);
                }

                ++store;
            }
        }

        array.swap(end - 1, store);

        for (i = 0; i < indicatorsLen; i++) {
            // Swap the data in the indicators too
            worldData.indicators[i].fullData.swap(end - 1, store);
        }

        return store;
    };

    var qsort = function (array, begin, end) {
        if (end - 1 > begin) {
            var pivot = begin + Math.floor(Math.random() * (end - begin));

            pivot = partition(array, begin, end, pivot);

            qsort(array, begin, pivot);
            qsort(array, pivot + 1, end);
        }
    };

    qsort(worldData.countries, 0, worldData.countries.length);
};

WorldStats.Helpers.selectedCountries = [];

// Define application model
WorldStats.createNS("WorldStats.Models");

WorldStats.Models.countries = function (countries) {
    // private variables
    var instance,
        regionIndex = {},
        regionList = [];

    // private methods
    var init = function () {
        generateRegionInfo();
    };

    var getCountries = function () {
        return countries;
    };

    var getCountry = function (index) {
        return countries[index];
    };

    var getCountriesLength = function (index) {
        return countries.length;
    };

    var generateRegionInfo = function () {
        var regionMap = {},
            countryMap = {},
            currentCountry,
            i;

        for (i = 0; i < getCountriesLength(); i++) {
            currentCountry = getCountry(i);

            countryMap[currentCountry.code] = currentCountry;
            if (typeof regionMap[currentCountry.regionType] != 'undefined') {
                regionMap[currentCountry.regionType].push(currentCountry);
            } else {
                regionMap[currentCountry.regionType] = [currentCountry];
                regionIndex[currentCountry.regionType] = regionList.length;
                regionList.push({
                    regionType: currentCountry.regionType,
                    countries: regionMap[currentCountry.regionType]
                });
            }
        }
    };

    var getRegionIndex = function () {
        return regionIndex;
    };

    var getRegionList = function () {
        return regionList;
    };

    if (!instance) {
        instance = init();
    }

    // public API
    return {
        getCountries: getCountries,
        getCountry: getCountry,
        getCountriesLength: getCountriesLength,
        getRegionIndex: getRegionIndex,
        getRegionList: getRegionList
    }
};

// Define application core
WorldStats.createNS("WorldStats.Panels");

WorldStats.Panels.manager = function (element, context) {
    // private variables
    var instance,
        expandCollapseButtonSelector = "#jsExpandCollapseButton",
        splitterBarSelector,
        firstPanelSize = 250;

    // private methods
    var createUI = function () {
        $(element).igSplitter({
            height: $(window).height(),
            //width: "100%",
            width: $(window).width(),
            panels: [
                {
                    size: firstPanelSize,
                    resizable: false,
                    collapsible: true
                },
                {
                    size: $(window).width() - firstPanelSize,
                    resizable: false,
                    collapsible: true
                }
            ]
        });

        $(element)
            .igSplitter("firstPanel")
            .append($.ig.tmpl($("#mainPanelTemplate").html(), WorldStats.Resources.General));

        $(element)
            .igSplitter("secondPanel")
            .append($.ig.tmpl($("#chartsPanelTemplate").html(), WorldStats.Resources.General));

        $(splitterBarSelector).empty();
    };

    var unbindHandlers = function () {
        $(expandCollapseButtonSelector).off("click");
        $(window).off("orientationchange resize");
    };

    var bindHandlers = function () {
        $(expandCollapseButtonSelector).click(function () {
            expandCollapse($(this));
            return false;
        });

        $(window).on("orientationchange resize", function () {
            //Stop running animations
            $('#mainPanel').add('#chartsPanel').stop(true, true);
            updateUIControlsHeightAndWidth();
        });
    };

    var updateUIControlsHeightAndWidth = function () {
        $(element).igSplitter("option", "height", $(window).height());
        $(element).igSplitter("option", "width", $(window).width());
        $(element).igSplitter("setFirstPanelSize", firstPanelSize);
        $(element).igSplitter("setSecondPanelSize", $(window).width() - firstPanelSize);
    };

    var expandCollapse = function ($el) {
        var currentState = $el.data("state"),
            icon = $el.find('.ui-button-icon-primary'),
                states = {
                    collapse: {
                        name: "expand",
                        text: "Collapse"
                    },
                    expand: {
                        name: "collapse",
                        text: "Expand"
                    }
                },
            duration = 600,
            callback = function () {
                if (!$(this).is(':animated')) {
                    if (currentState === 'collapse') {
                        icon.removeClass('ui-icon-arrow-4-diag').addClass('ui-icon-arrow-5-diag');
                    } else {
                        icon.removeClass('ui-icon-arrow-5-diag').addClass('ui-icon-arrow-4-diag');
                    }
                    $(element).igSplitter(currentState + "At", 0);
                    $(window).trigger('resize');
                }
            },
            mainPanelWidth = 250,
            windowWidth = $(window).width();

        if (currentState === 'collapse') {
            $('#mainPanel').animate({ width: 0 }, { queue: false, duration: duration });
            $('#chartsPanel').animate({ width: windowWidth }, { queue: false, duration: duration, done: callback });
        } else {
            $('#mainPanel').animate({ width: 250 }, {queue: false, duration: duration });
            $('#chartsPanel').animate({ width: windowWidth - mainPanelWidth }, { queue: false, duration: duration, done: callback });
        }

        $el.data("state", states[currentState].name);
    };

    var init = function () {
        element = "#" + element;
        splitterBarSelector = element + " .ui-igsplitter-splitbar-vertical";

        createUI();
        unbindHandlers();
        bindHandlers();
    };

    if (!instance) {
        instance = init();
    }
};

WorldStats.Panels.main = function (element, context) {
    // private variables
    var instance,
        deselectAllCountriesButtonSelector = "#jsDeselectAllCountriesButton",
        aboutButtonIconSelector = "#jsAboutButton_icon",
        aboutButtonLabelSelector = "#jsAboutButton_lbl",
        countriesGrid = "#jsCountriesGrid";

    // private methods

    var isAlreadyClicked = function (args){
        for (var i = 0 ; i < args.selectedRows.length; ++i)
        {
            if (args.selectedRows[i].index === args.row.index) {
                return true;
            }
        }
        return false;
    }
    var createUI = function () {
        $(deselectAllCountriesButtonSelector).igButton({
            labelText: WorldStats.Resources.General.DeselectAllCountries,
            width: "204px"
        });
        
        $(aboutButtonLabelSelector).html(WorldStats.Resources.General.AboutThisApplication);

        $(countriesGrid).igGrid({
            width: "206",
            height: calculateGridHeight(),
            dataSource: context.countries.getCountries(),
            showHeader: false,
            columns: [{
                    headerText: "Country",
                    key: "displayName",
                    dataType: "string"
                }
            ],
            autoGenerateColumns: false,
            features: [
            {
                name: "Selection",
                mode: "row",
                rowSelectionChanged: function (ui, args) {
                        var rows = $(countriesGrid).igGridSelection("selectedRows");
                        selectCountriesFromRows(rows);
                        $("#jsBubbleChart").igDataChart("notifyVisualPropertiesChanged", "AFR");

                        // Fix for multiple section in igGrid
                        args.owner._ctrlSelect = false;
                        args.owner._mouseCtrlSelect = false;
                },
                // Fix for multiple section in igGrid
                rowSelectionChanging: function (ui, args) {
                    if (args.owner._isMouseDown) {
                        args.owner._ctrlSelect = true;
                        args.owner._mouseCtrlSelect = true;
                    }

                    if (args.owner.selectedRows().length >= 4 && !isAlreadyClicked(args)) {
                        WorldStats.Helpers.openDialog("maximumCountries", WorldStats.Resources.General.MaximumCountries);
                        return false;
                    }
                },
                multipleSelection: true
            }, {
                name: "RowSelectors",
                enableCheckBoxes: true,
                enableRowNumbering: false,
                checkBoxStateChanging: function (ui, args) {
                    if (args.isHeader) {
                        return false;
                    }
                    if (WorldStats.Helpers.selectedCountries.length >= 4 && args.newState != "off") {
                        WorldStats.Helpers.openDialog("maximumCountries", WorldStats.Resources.General.MaximumCountries);
                        return false;
                    }
                },
                checkBoxStateChanged: function (ui, args) {
                        var rows = $(countriesGrid).igGridSelection("selectedRows");
                        selectCountriesFromRows(rows);
                        $("#jsBubbleChart").igDataChart("notifyVisualPropertiesChanged", "AFR");
                },
                rowSelectorColumnWidth: 35
            }]
        });
    };

    var unbindHandlers = function () {
        $(aboutButtonIconSelector).off("click");
        $(aboutButtonLabelSelector).off("click");
        $(deselectAllCountriesButtonSelector).off("click");
    };

    var bindHandlers = function () {
        $(aboutButtonIconSelector).click(function () {
            aboutDialog();
            return false;
        });

        $(aboutButtonLabelSelector).click(function () {
            aboutDialog();
            return false;
        });

        $(deselectAllCountriesButtonSelector).click(function () {
            var i, changedCountrySelectionEvent = jQuery.Event("changedCountrySelection");

            for (i = 0; i < context.countries.getCountriesLength(); i++) {
                if (context.countries.getCountry(i).isSelected) {
                    changedCountrySelectionEvent.changedCountrySelectionIndex = i;
                    $(window).trigger(changedCountrySelectionEvent);
                }
            }

            $(countriesGrid).igGridSelection("clearSelection");

            $("#jsBubbleChart").igDataChart("notifyVisualPropertiesChanged", "AFR");
        });

        $(window).on("orientationchange resize", function () {
            updateUIControlsHeight();
        });
    };

    var calculateGridHeight = function () {
        var mainPanelHeight = $('#mainPanel').height(),
            logoHeight = $('.logo-main').outerHeight(true),
            countrySelectionHeight = $('.countrySelection').outerHeight(true),
            selectionRestrictionHeight = $('.selectionRestriction').outerHeight(true),
            deselectCountriesHeight = $('#jsDeselectAllCountriesButton').outerHeight(true),
            aboutHeight = $('.jsAboutButton').outerHeight(true);

        return mainPanelHeight - logoHeight - countrySelectionHeight - selectionRestrictionHeight - deselectCountriesHeight - aboutHeight;
    };

    var updateUIControlsHeight = function () {
        $(countriesGrid).igGrid("option", "height", calculateGridHeight());
    };

    var aboutDialog = function () {

        if ($('.ui-chart-tooltip.tooltip').length > 0) {
            $('.ui-chart-tooltip.tooltip').remove();
        }

        var element = "dialog";
        $("body").append("<div id='" + element + "' style='display:none;'>" +
            WorldStats.Resources.General.ShowcaseInfo +
        "</div>");

        $("#" + element).igDialog({
            state: "opened",
            modal: true,
            draggable: false,
            resizable: false,
            height: "570px",
            width: "700px",
            stateChanging: function (evt, ui) {
                // Check the igDialog state  
                if (ui.action === "close") {
                    $("#" + element).igDialog("destroy");
                    $("#" + element).remove();
                }
            }
        });

        $("#barcode").igQRCodeBarcode({
            height: "68px",
            width: "68px",
            data: document.URL,
            errorCorrectionLevel: "low",
            barsFillMode: "ensureEqualSize",
            stretch: "none"
        });
    };

    var selectCountriesFromRows = function (rows) {
        var i, j, selected = false,
            changedCountrySelectionEvent = jQuery.Event("changedCountrySelection");

        for (i = 0; i < context.countries.getCountriesLength(); i++) {
            selected = false;
            for (j = 0; j < rows.length; j++) {
                if (rows[j].index == i) {
                    selected = true;
                }
            }

            if ((selected && !context.countries.getCountry(i).isSelected) ||
                (!selected && context.countries.getCountry(i).isSelected)) {
                changedCountrySelectionEvent.changedCountrySelectionIndex = i;
                $(window).trigger(changedCountrySelectionEvent);
            }
        }
    }

    var init = function () {
        element = "#" + element;

        setTimeout(createUI, 0);
        unbindHandlers();
        bindHandlers();
    };

    if (!instance) {
        instance = init();
    }
};

WorldStats.Panels.charts = function (element, context) {
    // private variables
    var instance,
        expandCollapseButtonSelector = "#jsExpandCollapseButton",
        optionsButtonSelector = "#jsOptionsButton",
        optionsDialogSelector = "#jsOptionsDialog",
        containerDialogSelector = '.ui-igdialog',
        bubbleIndicatorSelector = "#jsBubbleIndicator",
        bubbleChartXIndicatorSelector = "#jsBubbleChartXIndicator",
        bubbleChartYIndicatorSelector = "#jsBubbleChartYIndicator",
        trendChartYIndicatorSelector = "#jsTrendChartYIndicator",
        bubbleChartXLogarithmSelector = "#jsBubbleChartXLogarithm",
        bubbleChartYLogarithmSelector = "#jsBubbleChartYLogarithm",
        trendChartYLogarithmSelector = "#jsTrendChartYLogarithm",
        bubbleLogarithmSelector = "#jsBubbleLogarithm",
        bubbleQualitySelector = "#jsBubbleQuality",
        playButtonSelector = "#jsPlayButton",
        sliderSelector = "#jsSlider",
        yearTextSelector = "#jsYearText",
        bubbleChartSelector = "#jsBubbleChart",
        trendChartSelector = "#jsTrendChart",
        trendChartLegendSelector = "#jsTrendChartLegend",
        countriesGrid = "#jsCountriesGrid",
        currentYear = 1930,
        minYear = 1800,
        maxYear = 2010,
        bubbleCanvas = {
            canvas: null,
            width: 1024,
            height: null,
            perRow: 0,
            numRows: 0,
            maxSize: 20.0,
            maxHalfSize: 10.0
        },
        indicator1Index,
        indicator2Index,
        indicator3Index,
        indicator4Index,
        indicator1,
        indicator2,
        indicator3,
        indicator4,
        indicator1IsLogarithmic = true,
        indicator2IsLogarithmic = false,
        indicator3IsLogarithmic = true,
        indicator4IsLogarithmic = true,
        isChartSetup = false,
        indicators = worldData.indicators,
        useQualityRender = false,
        enableCustomTooltip = true,
        tooltip,
        currentMarker = "",
        oldMarker = "",
        logarithmComboWidth = '55px',
        indicatorComboWidth = '140px',
        indicatorComboHeight = '27px',
        logarithmClass = 'logarithmCombo',
        indicatorClass = 'indicatorCombo',
        qualityClass = 'qualityCombo',
        countryToBeRemoved,
        resGeneral = WorldStats.Resources.General,
        setComboClass = function (selector, className) {
            $(selector).data().igCombo._fieldHolder.parent().addClass(className);
        };

    // private methods
    var createUI = function () {
        var regionInfo = {},
            series = [];

        $(optionsButtonSelector).igButton({
            labelText: resGeneral.Options,
            onlyIcons: true,
            icons: {
                primary: "ui-icon-gear"
            }
        });

        $(expandCollapseButtonSelector).igButton({
            labelText: resGeneral.Expand,
            onlyIcons: true,
            icons: {
                primary: "ui-icon-arrow-4-diag"
            }
        });

        $(playButtonSelector).igButton({
            labelText: resGeneral.Play,
            onlyIcons: true,
            icons: {
                primary: "ui-icon-play"
            }
        });

        $(sliderSelector).slider({
            range: "min",
            min: minYear,
            max: maxYear,
            value: currentYear
        });

        $(yearTextSelector).text(currentYear.toString());

        $(optionsDialogSelector).igDialog({
            height: '180px',
            state: "closed",
            showHeader: false,
            resizable: false,
            draggable: false,
            clickOutside: true,
            clickOutsideTrigger: optionsDialogSelector
        });

        $(bubbleChartYIndicatorSelector).igCombo({
            mode: "dropdown",
            width: indicatorComboWidth,
            height: indicatorComboHeight,
            dropDownButtonTitle: resGeneral.ShowDropDown,
            selectedItems: [{
                index: 2
            }],
            enableClearButton: false,
            dataSource: indicators,
            textKey: 'displayName',
            valueKey: 'id',
            itemTemplate: "<span title='${tooltip}'>${displayName}</span>",
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];
                    for (i = 0; i < indicators.length; i++) {
                        if (indicators[i].id == item.value) {
                            break;
                        }
                    }
                    if (i < indicators.length) {
                        indicator2Index = i;
                        selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                    }
                }
            }
        });

        setComboClass(bubbleChartYIndicatorSelector, indicatorClass);

        $(trendChartYIndicatorSelector).igCombo({
            mode: "dropdown",
            width: indicatorComboWidth,
            height: indicatorComboHeight,
            dropDownButtonTitle: resGeneral.ShowDropDown,
            selectedItems: [{
                index: 3
            }],
            enableClearButton: false,
            dataSource: indicators,
            textKey: 'displayName',
            valueKey: 'id',
            itemTemplate: "<span title='${tooltip}'>${displayName}</span>",
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];
                    for (i = 0; i < indicators.length; i++) {
                        if (indicators[i].id == item.value) {
                            break;
                        }
                    }
                    if (i < indicators.length) {
                        indicator3Index = i;
                        selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                    }
                }
            }
        });

        setComboClass(trendChartYIndicatorSelector, indicatorClass);

        $(bubbleChartYLogarithmSelector).igCombo({
            mode: "dropdown",
            width: logarithmComboWidth,
            dropDownButtonTitle: resGeneral.DropDownMessageForLogarithmSelector,
            enableClearButton: false,
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];

                    if (item.value == "log") {
                        indicator2IsLogarithmic = true;
                    } else {
                        indicator2IsLogarithmic = false;
                    }

                    selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                }
            }
        });

        setComboClass(bubbleChartYLogarithmSelector, logarithmClass);

        $(trendChartYLogarithmSelector).igCombo({
            mode: "dropdown",
            width: logarithmComboWidth,
            selectedItems: [{
                index: 0
            }],
            dropDownButtonTitle: resGeneral.DropDownMessageForLogarithmSelector,
            enableClearButton: false,
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];

                    if (item.value == "log") {
                        indicator3IsLogarithmic = true;
                    } else {
                        indicator3IsLogarithmic = false;
                    }

                    selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                }
            }
        });

        setComboClass(trendChartYLogarithmSelector, logarithmClass);

        $(bubbleChartXIndicatorSelector).igCombo({
            mode: "dropdown",
            width: indicatorComboWidth,
            height: indicatorComboHeight,
            dropDownButtonTitle: resGeneral.ShowDropDown,
            selectedItems: [{
                index: 0
            }],
            enableClearButton: false,
            dataSource: indicators,
            textKey: 'displayName',
            valueKey: 'id',
            itemTemplate: "<span title='${tooltip}'>${displayName}</span>",
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];
                    for (i = 0; i < indicators.length; i++) {
                        if (indicators[i].id == item.value) {
                            break;
                        }
                    }
                    if (i < indicators.length) {
                        indicator1Index = i;
                        selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                    }
                }
            }
        });

        setComboClass(bubbleChartXIndicatorSelector, indicatorClass);

        $(bubbleChartXLogarithmSelector).igCombo({
            mode: "dropdown",
            width: logarithmComboWidth,
            enableClearButton: false,
            dropDownButtonTitle: resGeneral.DropDownMessageForLogarithmSelector,
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];

                    if (item.value == "log") {
                        indicator1IsLogarithmic = true;
                    } else {
                        indicator1IsLogarithmic = false;
                    }

                    selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                }
            }
        });

        setComboClass(bubbleChartXLogarithmSelector, logarithmClass);

        $(bubbleIndicatorSelector).igCombo({
            mode: "dropdown",
            width: '159px',
            height: '34px',
            dropDownButtonTitle: resGeneral.ShowDropDown,
            selectedItems: [{
                index: 3
            }],
            enableClearButton: false,
            dataSource: indicators,
            textKey: 'displayName',
            valueKey: 'id',
            itemTemplate: "<span title='${tooltip}'>${displayName}</span>",
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];
                    for (i = 0; i < indicators.length; i++) {
                        if (indicators[i].id == item.value) {
                            break;
                        }
                    }
                    if (i < indicators.length) {
                        indicator4Index = i;
                        selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                    }
                }
            }
        });

        setComboClass(bubbleIndicatorSelector, indicatorClass);

        $(bubbleLogarithmSelector).igCombo({
            mode: "dropdown",
            width: logarithmComboWidth,
            height: '40px',
            enableClearButton: false,
            dropDownButtonTitle: resGeneral.DropDownMessageForLogarithmSelector,
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];

                    if (item.value == "log") {
                        indicator4IsLogarithmic = true;
                    } else {
                        indicator4IsLogarithmic = false;
                    }

                    selectIndicators(indicator1Index, indicator2Index, indicator3Index, indicator4Index, context.countries.getRegionList());
                }
            }
        });

        setComboClass(bubbleLogarithmSelector, logarithmClass);

        $(bubbleQualitySelector).igCombo({
            mode: "dropdown",
            width: '256px',
            height: '34px',
            dropDownButtonTitle: resGeneral.ShowDropDown,
            enableClearButton: false,
            selectionChanged: function (e, ui) {
                if (ui.items) {
                    var item = ui.items[0];

                    if (item.value == "low") {
                        useQualityRender = false;
                    } else {
                        useQualityRender = true;
                    }

                    $(bubbleChartSelector).igDataChart("styleUpdated");
                }
            }
        });

        setComboClass(bubbleQualitySelector, qualityClass);

        //Forces the initial rendering of the dialog. Needed to prevent the style refresh upon first open of the dialog.
        $(containerDialogSelector).css({ visibility: 'hidden', display: 'block' });

        setTimeout(function () {
            $(containerDialogSelector).css({ visibility: 'visible', display: 'none' });
        }, 200);

        selectIndicators(0, 2, 3, 3, context.countries.getRegionList());

        series = generateSeries(context.countries.getRegionList(), countryMarkerTemplate);

        ensureMarkerCanvas(context.countries.getCountries(), context.countries.getRegionIndex());

        $(bubbleChartSelector).igDataChart({
            width: "auto",
            height: calculateBubbleChartHeight(),
            axes: [{
                name: "xAxis",
                type: "numericX",
                minimumValue: indicator1.minimum,
                maximumValue: indicator1.maximum,
                isLogarithmic: indicator1IsLogarithmic,
                majorStroke: "rgba(223,217,220,0)",
                tickLength: 6,
                tickStroke: "#9e9495",
                labelTextStyle: "0.750em Open Sans, Helvetica, Arial",
                labelTopMargin: 7,
                formatLabel: function (item) {
                    return WorldStats.Helpers.numberFormatter(item);
                }
            }, {
                name: "yAxis",
                type: "numericY",
                minimumValue: indicator2.minimum,
                maximumValue: indicator2.maximum,
                isLogarithmic: indicator2IsLogarithmic,
                majorStroke: "rgba(223,217,220,1)",
                stroke: "rgba(223,217,220,0)",
                labelTextStyle: "0.750em Open Sans, Helvetica, Arial",
                labelRightMargin: 11,
                formatLabel: function (item) {
                    return WorldStats.Helpers.numberFormatter(item);
                },
                labelHorizontalAlignment: "right"
            }],
            series: series,
            horizontalZoomable: true,
            verticalZoomable: true,
            windowResponse: "immediate",
            seriesMouseMove: function (ev, ui) {
                if (currentMarker === "" && oldMarker === "") {
                    oldMarker = ui.item.displayName;
                }
                currentMarker = ui.item.displayName;
                if (currentMarker !== oldMarker && !Modernizr.touch) {
                    oldMarker = currentMarker;
                    $(bubbleChartSelector).igDataChart("notifyVisualPropertiesChanged", ui.series.name);
                }
            },
            seriesMouseEnter: function (ev, ui) {
                if (ui.item && ui.item.displayName && !Modernizr.touch) {
                    currentMarker = ui.item.displayName;
                    $(bubbleChartSelector).igDataChart("notifyVisualPropertiesChanged", ui.series.name);
                }
            },
            seriesMouseLeave: function (ev, ui) {
                if (!Modernizr.touch && tooltip) {
                    tooltip.remove();
                    $(bubbleChartSelector).off("igdatachartwindowrectchanged", removeTooltip);
                    $(bubbleChartSelector).off("igdatachartseriesmousemove", removeTooltip);
                }
                currentMarker = "";
                $(bubbleChartSelector).igDataChart("notifyVisualPropertiesChanged", ui.series.name);
            },
            seriesMouseLeftButtonUp: function (ev, ui) {

                removeTooltip = function () {
                    tooltip.remove();
                    $(bubbleChartSelector).off("igdatachartwindowrectchanged", removeTooltip);
                    $(bubbleChartSelector).off("igdatachartseriesmousemove", removeTooltip);
                };

                if (tooltip) {
                    removeTooltip();
                }

                /*TODO TEMPORARY
                changeCountrySelection(ui.item, context.countries.getRegionList());

                if (WorldStats.Helpers.selectedCountries.indexOf(ui.item) > -1 && ui.item.isSelected) {
                    $(countriesGrid).igGridSelection("selectRow", ui.item.index);
                } else if (ui.item == countryToBeRemoved){
                    $(countriesGrid).igGridSelection("deselectRow", ui.item.index);
                }
                */
                if (enableCustomTooltip && Modernizr.touch) {
                
                    tooltip = getTooltipTemplate("bubbleTooltip", ui, {
                        positionX: ui.positionX + ev.target.offsetLeft,
                        positionY: ui.positionY + ev.target.offsetTop
                    });

                    setTimeout(function () {
                        $(bubbleChartSelector).on("igdatachartwindowrectchanged", removeTooltip);
                        $(bubbleChartSelector).on("igdatachartseriesmousemove", removeTooltip);
                    }, 100);

                    $("body").append(tooltip);
                }
            },
            tooltipShowing: function (ev, ui) {
                enableCustomTooltip = false;
            },
            tooltipHidden: function (ev, ui) {
                enableCustomTooltip = true;
            }
        });

        //set minimal zoom
        $(bubbleChartSelector).data("igDataChart")._chart.windowRectMinWidth(0.25);

        $(trendChartSelector).igDataChart({
            width: "auto",
            height: calculateTrendChartHeight(),
            brushes: ["#6a4a3c", "#009989", "#e66048", "#883959"],
            axes: [{
                name: "xAxis",
                type: "categoryX",
                majorStroke: "rgba(22,22,22,0)", 
                label: "year",
                dataSource: generateEmptySeriesData(),
                tickLength: 6,
                stroke: "rgba(158, 148, 149, 1)",
                labelTextStyle: "0.750em Open Sans, Helvetica, Arial",
                labelTopMargin: 7
            }, {
                name: "yAxis",
                type: "numericY",
                minimumValue: indicator3.minimum,
                maximumValue: indicator3.maximum,
                isLogarithmic: indicator3IsLogarithmic,
                majorStroke: "rgba(216, 210, 210, 1)",
                stroke: "rgba(223,217,220,0)",
                labelTextStyle: "0.750em  Open Sans,Helvetica, Arial",
                labelRightMargin: 11,
                formatLabel: function (item) {
                    return WorldStats.Helpers.numberFormatter(item);
                },
                labelHorizontalAlignment: "right"
            }],
            horizontalZoomable: true,
            verticalZoomable: false,
            windowResponse: "immediate",
            legend: {
                element: trendChartLegendSelector.replace("#", ""),
                width: "150px",
                height: calculateTrendChartHeight()
            }
        });

        $(trendChartSelector).data("igDataChart")._chart.windowRectMinWidth(0.25);

        WorldStats.Helpers.openTrendChartHint();

        isChartSetup = true;
    };

    var unbindHandlers = function () {
        $(optionsButtonSelector).off("click");
        $(playButtonSelector).off("click");
        $(sliderSelector).off("slide");
        $(window).on("changedCountrySelection");
    };

    var bindHandlers = function () {
        var playing = false,
            internvalId,
            timeout = 510;

        $(optionsButtonSelector).click(function () {
            positionOptionDialog();
            if ($(optionsDialogSelector).igDialog("state") === 'closed') {
                $(optionsDialogSelector).igDialog("open");
            } else {
                $(optionsDialogSelector).igDialog("close");
            }
            return false;
        });

        $(playButtonSelector).click(function () {
            if (!playing) {
                playing = true;

                internvalId = window.setInterval(function () {
                    currentYear++;
                    if (currentYear > maxYear) {
                        currentYear = minYear;
                        $(sliderSelector).slider("option", "value", minYear);
                        refreshData(context.countries.getRegionList());
                        $(yearTextSelector).text(minYear.toString());
                    } else {
                        $(sliderSelector).slider("option", "value", currentYear);
                        refreshData(context.countries.getRegionList());
                        $(yearTextSelector).text(currentYear.toString());
                    }
                }, timeout);

                $(playButtonSelector).igButton("option", "icons", {
                    primary: "ui-icon-pause"
                });

            } else {
                playing = false;
                $(playButtonSelector).igButton("option", "icons", {
                    primary: "ui-icon-play"
                });
                window.clearInterval(internvalId);
            }
        });

        $(sliderSelector).on("slide", function (ev, ui) {
            changeYear(ui.value);
        });

        $(window).on("orientationchange resize", function (ev) {
            positionOptionDialog();
            updateUIControlsHeight();
        });

        $(window).on("changedCountrySelection", function (ev) {
            changeCountrySelection(context.countries.getCountry(ev.changedCountrySelectionIndex),
                context.countries.getRegionList());
        });
    };

    var getTooltipTemplate = function (element, data, position) {
        var tooltip = $("<div></div>"),
            htmlTemplate = $("#" + element).html(),
            complitedTemplate;

        tooltip.addClass("tooltip ui-chart-tooltip ui-widget-content ui-corner-all");

        complitedTemplate = $.ig.tmpl(htmlTemplate, {
            item: data.item
        });

        tooltip.html(complitedTemplate);

        tooltip.css({
            top: position.positionY,
            left: position.positionX,
            borderColor: data.actualItemBrush
        });

        return tooltip;
    };

    var positionOptionDialog = function () {
        var offset = $(optionsButtonSelector).offset(),
               deltaLeft = -259,
               deltaRight = 34;

        $(optionsDialogSelector).igDialog("option", "position", [offset.left + deltaLeft, offset.top + deltaRight]);
    };

    var calculateBubbleChartHeight = function () {
        var combinedChartsHeight = $('.combinedCharts').height(),
            headerHeight = $('.charts-header').outerHeight(true),
            footerHeight = $('.bubbleChartXControls').outerHeight(true);
        return combinedChartsHeight - headerHeight - footerHeight;
    };

    var calculateTrendChartHeight = function () {
        var percentOfTrendChartHeight = .2,
            wHeight = $(window).height(),
            height = wHeight > 600 ? wHeight : 600;
        return height * percentOfTrendChartHeight;
    };

    var calculateTrendChartHeight = function () {
        var combinedChartsHeight = $('.selectedCharts').height(),
            footerHeight = $('.trendChartXText').outerHeight(true);
        return combinedChartsHeight - footerHeight;
    };

    var updateUIControlsHeight = function () {
        var legend, trendChartHeight = calculateTrendChartHeight();
        $(bubbleChartSelector).igDataChart("option", "height", calculateBubbleChartHeight());
        $(trendChartSelector).igDataChart("option", "height", trendChartHeight);
        $(trendChartLegendSelector).igChartLegend("option", "height", trendChartHeight);
    };

    var countryMarkerTemplate = {
        measure: function (measureInfo) {
            var size = WorldStats.Helpers.bubble().getBubbleSize(bubbleCanvas.maxSize,
                measureInfo.data.item(),
                indicator4,
                indicator4IsLogarithmic);

            measureInfo.width = size;
            measureInfo.height = size;
        },
        render: function (renderInfo) {

            addHoverEffectOnBubbles(renderInfo);

            var bubbleRenderingHelper = WorldStats.Helpers.bubbleRendering(),
                bubbleHelper = WorldStats.Helpers.bubble(),
                qualityRenderParameters = {
                    bubbleHelper: bubbleHelper,
                    maxSize: bubbleCanvas.maxSize,
                    indicator4: indicator4,
                    indicator4IsLogarithmic: indicator4IsLogarithmic,
                    countries: context.countries
                };

            if (useQualityRender) {
                bubbleRenderingHelper.qualityRender(renderInfo, qualityRenderParameters);
            } else {
                bubbleRenderingHelper.fastRender(renderInfo,
                                bubbleCanvas.perRow,
                                bubbleCanvas.canvas,
                                bubbleCanvas.maxSize,
                                bubbleCanvas.maxHalfSize);
            }
        }
    };

    var addHoverEffectOnBubbles = function (renderInfo) {
        var notSelectedCountry = (WorldStats.Helpers.selectedCountries.indexOf(renderInfo.data._item) == -1 && !renderInfo.isHitTestRender);
        var notSelectedHoveredCountry = false;
        var notHoveredCountry = false;
        if (renderInfo.data._item !== null) {
            notSelectedHoveredCountry = (currentMarker == renderInfo.data._item.displayName && !renderInfo.isHitTestRender);
            notHoveredCountry = (currentMarker !== "" && currentMarker !== renderInfo.data._item.displayName && !renderInfo.isHitTestRender);
        }
        
        if (WorldStats.Helpers.selectedCountries.length > 0) {
            if (notSelectedCountry) {
                renderInfo.context.globalAlpha = 0.2;
            }

            if (notSelectedHoveredCountry) {
                renderInfo.context.globalAlpha = 1;
            }
        } else if (notHoveredCountry) {
            renderInfo.context.globalAlpha = 0.2;
        }
    }

    var changeCountrySelection = function (country, regionList) {
        if (country.isSelected) {
            country.isSelected = false;

            $(trendChartSelector).igDataChart("option", "series", [{
                name: country.code + "incremental",
                remove: true,
            }]);

            if (WorldStats.Helpers.selectedCountries.indexOf(country) >= 0) {
                countryToBeRemoved = country;
                WorldStats.Helpers.selectedCountries.splice(WorldStats.Helpers.selectedCountries.indexOf(country), 1);
            }
            if (WorldStats.Helpers.selectedCountries.length === 0) {
                WorldStats.Helpers.openTrendChartHint();
            }
        } else {
            WorldStats.Helpers.closeTrendChartHint();
            country.isSelected = true;
            refreshData(regionList);

            if (WorldStats.Helpers.selectedCountries.length === 4) {
                WorldStats.Helpers.openDialog("maximumCountries", WorldStats.Resources.General.MaximumCountries);
            } else {
                var countryNotSelected = WorldStats.Helpers.selectedCountries.indexOf(country) == -1;
                if (countryNotSelected) {
                    WorldStats.Helpers.selectedCountries.push(country);
                }

                $(trendChartSelector).igDataChart("option", "series", [{
                    name: country.code + "incremental",
                    type: "line",
                    title: country.displayName,
                    dataSource: country.incrementalData,
                    valueMemberPath: "value",
                    transitionDuration: 500,
                    xAxis: "xAxis",
                    yAxis: "yAxis",
                    legendItemBadgeTemplate: {
                        measure: function (measureInfo) {
                        },
                        render: function (renderInfo) {
                            var c = renderInfo.context.canvas;
                            c.width = 20;
                            c.height = 20;
                            var ctx = c.getContext("2d");
                            ctx.rect(6, 6, 13, 13);
                            actualItemBrush = renderInfo.data.actualItemBrush();
                            if (actualItemBrush != null) {
                                ctx.fillStyle = actualItemBrush.__fill;
                            }
                            ctx.fill();
                        }
                    }
                }]);
            }
        }
    }

    var selectIndicators = function (ind1, ind2, ind3, ind4, regionList) {
        indicator1Index = ind1,
        indicator2Index = ind2,
        indicator3Index = ind3,
        indicator4Index = ind4,

        indicator1 = indicators[indicator1Index];
        indicator2 = indicators[indicator2Index];
        indicator3 = indicators[indicator3Index];
        indicator4 = indicators[indicator4Index];

        if (isChartSetup) {
            $(bubbleChartSelector).igDataChart("option", "axes", [{
                name: "xAxis",
                minimumValue: indicator1.minimum,
                maximumValue: indicator1.maximum,
                isLogarithmic: indicator1IsLogarithmic
            }, {
                name: "yAxis",
                minimumValue: indicator2.minimum,
                maximumValue: indicator2.maximum,
                isLogarithmic: indicator2IsLogarithmic
            }]);

            $(trendChartSelector).igDataChart("option", "axes", [{
                name: "yAxis",
                minimumValue: indicator3.minimum,
                maximumValue: indicator3.maximum,
                isLogarithmic: indicator3IsLogarithmic
            }]);
        }

        refreshData(context.countries.getRegionList());
    };

    var refreshData = function (regionList) {
        var indicator3Changed, i, j, currentCountry, needReset;

        for (i = 0; i < context.countries.getCountriesLength(); i++) {
            currentCountry = context.countries.getCountry(i);

            indicator3Changed = false;
            if (currentCountry.indicator3 != indicator3) {
                indicator3Changed = true;
            }

            currentCountry.indicator1 = indicator1;
            currentCountry.indicator2 = indicator2;
            currentCountry.indicator3 = indicator3;
            currentCountry.indicator4 = indicator4;

            currentCountry.value1 = indicator1.fullData[i][currentYear - minYear];
            currentCountry.value2 = indicator2.fullData[i][currentYear - minYear];
            currentCountry.value3 = indicator3.fullData[i][currentYear - minYear];
            currentCountry.value4 = indicator4.fullData[i][currentYear - minYear];

            if (currentCountry.isSelected) {
                needReset = indicator3Changed;
                if (typeof currentCountry.fullData == "undefined") {
                    currentCountry.fullData = [];
                    currentCountry.incrementalData = [];
                    currentCountry.lastIncremental = -1;
                    needReset = true;
                }

                if (needReset) {
                    currentCountry.incrementalData.length = 0;
                    currentCountry.lastIncremental = 0;

                    for (j = 0; j < indicator3.fullData[j].length; j++) {
                        currentCountry.fullData[j] = {
                            year: j + minYear,
                            value: indicator3.fullData[i][j]
                        };
                        if (j <= currentYear - minYear) {
                            currentCountry.incrementalData[j] = {
                                year: j + minYear,
                                value: indicator3.fullData[i][j]
                            };
                            currentCountry.lastIncremental = j;
                        }
                    }

                    if (isChartSetup) {
                        $(trendChartSelector).igDataChart("notifyClearItems", currentCountry.incrementalData);
                    }
                } else {
                    if (currentYear != currentCountry.lastIncremental) {
                        for (j = currentCountry.lastIncremental; j > currentYear - minYear; j--) {
                            var oldItem = currentCountry.incrementalData[j];
                            currentCountry.incrementalData.splice(j, 1);
                            currentCountry.lastIncremental = j - 1;

                            $(trendChartSelector).igDataChart("notifyRemoveItem",
                                currentCountry.incrementalData,
                                j,
                                oldItem
                            );
                        }
                    }

                    if (currentYear != currentCountry.lastIncremental) {
                        for (j = currentCountry.lastIncremental + 1; j <= currentYear - minYear; j++) {
                            currentCountry.incrementalData[j] = {
                                year: j + minYear,
                                value: indicator3.fullData[i][j]
                            };
                            currentCountry.lastIncremental = j;

                            $(trendChartSelector).igDataChart("notifyInsertItem",
                                currentCountry.incrementalData,
                                j,
                                currentCountry.incrementalData[j]
                            );
                        }
                    }
                }
            }
        }

        notifyCharts(context.countries.getRegionList());
    };

    var changeYear = function (newYear) {
        currentYear = newYear;
        $(yearTextSelector).text(currentYear.toString());

        refreshData(context.countries.getRegionList());
    };

    var notifyCharts = function (regionList) {
        if (!isChartSetup) {
            return;
        }

        for (i = 0; i < regionList.length; i++) {
            $(bubbleChartSelector).igDataChart("notifyClearItems", regionList[i].countries);
        }
    };

    // Cache the marker shapes for better performance in browsers with slower canvas
    // implementations

    var ensureMarkerCanvas = function (countries, regionIndex) {
        var ctx,
            currBrush,
            currOutline,
            top,
            left,
            currentCountry,
            brushes = WorldStats.Helpers.getBrushes(),
            outlines = WorldStats.Helpers.getOutlines();
            bubbleHelper = WorldStats.Helpers.bubble();

        if (bubbleCanvas.canvas != null) {
            return;
        }

        bubbleCanvas.perRow = Math.floor(bubbleCanvas.width / bubbleCanvas.maxSize);
        bubbleCanvas.numRows = Math.ceil(countries.length / bubbleCanvas.perRow);
        bubbleCanvas.height = (bubbleCanvas.maxSize * bubbleCanvas.numRows);

        bubbleCanvas.canvas = bubbleHelper.cacheBubblesAtCanvas("bubbleCanvas",
            bubbleCanvas.width,
            bubbleCanvas.height,
            false);

        ctx = bubbleCanvas.canvas.getContext("2d");

        for (i = 0; i < countries.length; i++) {
            currentCountry = countries[i];
            currentCountry.index = i;

            currBrush = brushes[regionIndex[currentCountry.regionType]];
            currOutline = outlines[regionIndex[currentCountry.regionType]];

            top = Math.floor(i / bubbleCanvas.perRow) * bubbleCanvas.maxSize;
            left = (i % bubbleCanvas.perRow) * bubbleCanvas.maxSize;

            bubbleHelper.drawBubbleRectangle(ctx, currBrush, currOutline, {
                Y: top,
                X: left
            }, bubbleCanvas.maxSize);

            bubbleHelper.drawTextInBubble(ctx, currentCountry.code, {
                Y: top + bubbleCanvas.maxHalfSize,
                X: left + bubbleCanvas.maxHalfSize
            }, bubbleCanvas.maxSize);
        }
    };

    var generateEmptySeriesData = function () {
        var emptySeriesData = [], i;

        for (i = minYear; i < maxYear; i++) {
            emptySeriesData[i - minYear] = {
                year: i.toString(),
                value: NaN
            };
        }

        return emptySeriesData;
    };

    var generateSeries = function (regionList, markerTemplate) {
        var currentRegion, series = [], i;

        for (i = 0; i < regionList.length; i++) {
            currentRegion = regionList[i];

            series.push({
                name: currentRegion.regionType,
                type: "scatter",
                xAxis: "xAxis",
                yAxis: "yAxis",
                xMemberPath: "value1",
                yMemberPath: "value2",
                markerTemplate: markerTemplate,
                dataSource: currentRegion.countries,
                transitionDuration: 500,
                showTooltip: true,
                tooltipTemplate: "bubbleTooltip"
            });
        }

        return series;
    };

    var init = function () {
        element = "#" + element;

        setTimeout(createUI, 0);
        unbindHandlers();
        bindHandlers();
    };

    if (!instance) {
        instance = init();
    }
};

// Define entry point for application
WorldStats.init = function () {
    var titleSelector = "title";

    WorldStats.Helpers.sortWorldData();

    $(titleSelector).text(WorldStats.Resources.General.Title);

    var countries = WorldStats.Models.countries(worldData.countries);

    WorldStats.Panels.manager("panels");

    WorldStats.Panels.main("mainPanel", {
        countries: countries
    });

    WorldStats.Panels.charts("chartsPanel", {
        countries: countries
    });

    WorldStats.Helpers.messageForSupportedWidth($("body"));
};

/* jQuery UI dialog clickoutside */

$.widget("ui.igDialog", $.ui.igDialog, {
    options: {
        clickOutside: false, // Determine if clicking outside the dialog shall close it
        clickOutsideTrigger: "" // Element (id or class) that triggers the dialog opening 
    },
    open: function () {
        var clickOutsideTriggerEl = $(this.options.clickOutsideTrigger);
        var that = this;

        var close = function (ev) {
            if ($(ev.target).closest($(clickOutsideTriggerEl)).length === 0 &&
                    $(ev.target).closest($(that.element[0])).length === 0 &&
                    !$(ev.target).hasClass("ui-igcombo-listitem") &&
                    !$(ev.target).is("span")) {
                that.close();
            }
        };

        if (this.options.clickOutside) {
            // Add document wide click handler for the current dialog namespace
            $(document).on("click.ui.dialogClickOutside" + that.eventNamespace, function (ev) {
                close(ev);
            });

            $(document).on("touchstart.ui.dialogClickOutside" + that.eventNamespace, function (ev) {
                close(ev);
            });
        }

        this._super(); // Invoke parent open method
    },
    close: function () {
        var that = this;

        // Remove document wide click handler for the current dialog
        $(document).off("click.ui.dialogClickOutside" + that.eventNamespace);
        $(document).off("touchstart.ui.dialogClickOutside" + that.eventNamespace);

        this._super(); // Invoke parent close method 
    }
});