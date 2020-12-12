/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
/**
 This Script is used to calculate the end date for each charge record from its corresponding subscription.
 */

define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/render', 'N/email', 'N/file', 'N/encode', 'N/task', 'N/url', 'N/redirect', 'N/runtime', 'N/format'],

    function (record, search, serverWidget, render, email, file, encode, task, url, redirect, runtime, format) {

        function calculateEndDate(context) {
            try {
                log.debug("context.type", context.type)
                if (context.type == 'create') {
                    
                    var objRec = context.newRecord
                    log.debug("objRec", objRec)
                    var id = objRec.id;

                  
                    var objRecordNew = record.load({
                        type: record.Type.CHARGE,
                        id: id,
                        isDynamic: true,
                    });

                    var chargDate = objRecordNew.getValue({
                        fieldId:'chargedate'
                    })
                    log.debug('chargDate',chargDate)
                    //dates
                  

                    //fetch subscription line value
                    var subscriptionLineOnCHargeRecord = objRec.getValue({
                        fieldId: 'subscriptionline'
                    })
                    log.debug('subscriptionLine', subscriptionLineOnCHargeRecord)

                    //load subscription line
                    var lineRec = record.load({
                        type: record.Type.SUBSCRIPTION_LINE,
                        id: subscriptionLineOnCHargeRecord,
                        isDynamic: true,
                    });

                    var lineNumber = lineRec.getValue({
                        fieldId:'linenumber'
                    })

                    var subscriptionId = lineRec.getValue({
                        fieldId: 'subscription'
                    })
                    log.debug('subscriptionId', subscriptionId)


                    var objRecord = record.load({
                        type: record.Type.SUBSCRIPTION,
                        id: subscriptionId,
                        isDynamic: true,
                    });
                    log.debug('objRecord', objRecord)


                    var chargeType = objRec.getText({
                        fieldId: 'chargetype'
                    })
                    log.debug('chargeType', chargeType)

                    if (chargeType == "One-Time") {

                        var startDate = objRecord.getValue({fieldId: 'startdate'})
                        var endDate = objRecord.getValue({fieldId: 'enddate'})
                        log.debug('start & end Date', startDate + " & " + endDate)


                    } else {

                        
                        var numLinePriceList = objRecord.getLineCount({
                            sublistId: 'priceinterval'
                        })
                    

                          

                                for (var j = 0; j < numLinePriceList; j++) {
                                    var subscriptionlineNumber = objRecord.getSublistValue({
                                        sublistId: 'priceinterval',
                                        fieldId: 'subscriptionplanlinenumber',
                                        line: j
                                    })
                                   

                                    if (lineNumber == subscriptionlineNumber) {
                                        log.debug('subscriptionlineNumber',subscriptionlineNumber)
                                        var frequency = objRecord.getSublistText({
                                            sublistId: 'priceinterval',
                                            fieldId: 'frequency',
                                            line: j
                                        });
                                        log.debug("frequency", frequency)

                                        var repeatEvary = objRecord.getSublistText({
                                            sublistId: 'priceinterval',
                                            fieldId: 'repeatevery',
                                            line: j
                                        });
                                        log.debug("repeatevery", repeatEvary)
                                        break;
                                        
                                    }
                                    if(frequency){break}
                                }
                            
                        if (checkif(frequency)) {

                            if (frequency == "Monthly") {
                            
                                    if (checkif(repeatEvary)) {
                                        log.debug("repeatEvary",repeatEvary)


                                        var updatedDate = new Date(chargDate);
                                        log.debug('updatedDate',updatedDate)
                                        var month = Number(updatedDate.getMonth()) + Number(repeatEvary)
                                        log.debug('month',month)
                                        var endDate = new Date(updatedDate.getFullYear(), month , 0)
                                        log.debug("endDate", endDate)
                                    } 
                                    // else if (repeatEvary == 3) {
                                    //     var updatedDate = new Date(chargDate);
                                    //     var endDate = new Date(updatedDate.getFullYear(), updatedDate.getMonth() + 3, 0)
                                    //     log.debug("endDate", endDate)
                                    // }
                            } else if (frequency == "Annually") {
                                var updatedDate = new Date(chargDate);
                                var endDate = new Date(updatedDate.getFullYear() + 1, updatedDate.getMonth(), 0)
                                log.debug("endDate", endDate)
                            }

                            // endDate = format.format({
                            //     value: endDate,
                            //     type: format.Type.DATE,
                            // });
                            //
                            // log.debug("endDate", endDate)

                        }
                        else{
                            log.debug('alterworld')
                            
                            var endDate = objRecordNew.getValue({
                                fieldId:'serviceenddate'
                            })
                            
        
                        }
                    }

                    if(checkif(endDate)){

                    objRecordNew.setValue({
                        fieldId: 'custrecord_nap_charge_end_date',
                        value: endDate
                    })
                }
                    objRecordNew.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });

                }
            } catch (e) {
                log.debug("error@calculateEndDate", e)
            }
        }

        function checkif(param) {
            try {
                if (param == undefined || param == null || param == "" || param == " ")
                    return false;
                else
                    return true;

            } catch (e) {
                console.log("err@ checkif", e)
            }
        }



        var main = {
            afterSubmit: function (context) {
                calculateEndDate(context)
            }
        }
        return main;
    });
