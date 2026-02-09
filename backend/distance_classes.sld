<?xml version="1.0" encoding="ISO-8859-1"?>
 2 <StyledLayerDescriptor version="1.0.0"
 3     xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd"
 4     xmlns="http://www.opengis.net/sld"
 5     xmlns:ogc="http://www.opengis.net/ogc"
 6     xmlns:xlink="http://www.w3.org/1999/xlink"
 7     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

    <NamedLayer>
        <Name>Distance Classes</Name>

        <UserStyle>
           <Title>Coloring Polygons by Distance Class</Title>

           <FeatureTypeStyle>

                <!-- Rule Distance Class 0 (correct community) -->
                <Rule>
                    <Title>Perfect Score</Title>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                            <ogc:PropertyName>distance_class</ogc:PropertyName>
                            <ogc:Literal>0</ogc:Literal>
                        </ogc:PropertyIsEqualTo>
                    </ogc:Filter>
                    <PolygonSymbolizer>
                        <Fill>
                            <CssParameter name="fill">#1a9641</CssParameter>
                            <CssParameter name="fill-opacity">0.6</CssParameter>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#333333</CssParameter>
                            <CssParameter name="stroke-width">0.6</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>
                </Rule>

                <!-- Rule Distance Class 1 (neighbouring community, green) -->
                <Rule>
                    <Title>Almost</Tile>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>distance_class</ogc:PropertyName>
                                <ogc:Literal>0</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                        </ogc:Filter>
                        <PolygonSymbolizer>
                    </ogc:Filter>
                    <PolygonSymbolizer>
                        <Fill>
                            <CssParameter name="fill">#1a9641</CssParameter>
                            <CssParameter name="fill-opacity">0.6</CssParameter>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#333333</CssParameter>
                            <CssParameter name="stroke-width">0.6</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>
                </Rule>

                <!-- Rule Distance Class 2 (community <= 20k m away, yellow) -->
                <Rule>
                    <Title>up to 20km</Tile>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>distance_class</ogc:PropertyName>
                                <ogc:Literal>2</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                        </ogc:Filter>
                        <PolygonSymbolizer>
                    </ogc:Filter>
                    <PolygonSymbolizer>
                        <Fill>
                            <CssParameter name="fill">#ffffbf</CssParameter>
                            <CssParameter name="fill-opacity">0.6</CssParameter>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#ffffbf</CssParameter>
                            <CssParameter name="stroke-width">0.6</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>
                </Rule>

                <!-- Rule Distance Class 3 (community <= 50k m away, orange) -->
                <Rule>
                    <Title>up to 50km</Tile>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>distance_class</ogc:PropertyName>
                                <ogc:Literal>3</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                        </ogc:Filter>
                        <PolygonSymbolizer>
                    </ogc:Filter>
                    <PolygonSymbolizer>
                        <Fill>
                            <CssParameter name="fill">#fdae61</CssParameter>
                            <CssParameter name="fill-opacity">0.6</CssParameter>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#fdae61</CssParameter>
                            <CssParameter name="stroke-width">0.6</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>
                </Rule>

                <!-- Rule Distance Class 4 (community over 50k m away, red) -->
                <Rule>
                    <Title>up to 50km</Tile>
                    <ogc:Filter>
                        <ogc:PropertyIsEqualTo>
                                <ogc:PropertyName>distance_class</ogc:PropertyName>
                                <ogc:Literal>4</ogc:Literal>
                            </ogc:PropertyIsEqualTo>
                        </ogc:Filter>
                        <PolygonSymbolizer>
                    </ogc:Filter>
                    <PolygonSymbolizer>
                        <Fill>
                            <CssParameter name="fill">#d7191c</CssParameter>
                            <CssParameter name="fill-opacity">0.6</CssParameter>
                        </Fill>
                        <Stroke>
                            <CssParameter name="stroke">#d7191c</CssParameter>
                            <CssParameter name="stroke-width">0.6</CssParameter>
                        </Stroke>
                    </PolygonSymbolizer>
                </Rule>
          </FeatureTypeStyle>

        </UserStyle>

    </NamedLayer>

 </StyledLayerDescriptor>