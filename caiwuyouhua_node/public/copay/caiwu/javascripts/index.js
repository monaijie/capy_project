/**
 * Created by weicong on 17/10/16.
 */
$(document).ready(function () {
    window.vm = {

        //region 辅助数据
        naneForInsured: '',//被保人姓名
        getSelectMyOrderIndex: 0,//被选中的被保人下标
        //endregion 辅助数

        //region 主要数据
        userInfo: {
            policyType: 'NGB',
            numNo: 43,
            holder: '张三',
            insured: 'Jeck Mei',
            amount: 43
        },
        myOrder: [],
        //endregion 主要数据

        //region 监听事件
        click: {
            commitPayClick: function () {
                console.log("CONROLLER:commitPayClick()点击确认支付按钮");
                var deferred = Deferred();
                var that = vm;
                var userInfo = {
                    policyType: 'NGB',
                    numNo: 43,
                    holder: '张三',
                    insured: 'Jeck Mei',
                    amount: 43
                };
                that.InsuranceTypechange(userInfo)
                    .then(function (userInfo) {
                        return that.numberFilling(userInfo)
                    })
                    .then(function (userInfo) {
                        if (userInfo.numNo && userInfo.policyType) {
                            return vm.getUserInfo(userInfo)
                        }else{
                            return userInfo
                        }
                    })
                    .then(function (userInfo) {
                        return that.submitInfo(userInfo);
                    })
                    .otherwise(function (msg) {
                        avalon.log(msg);
                        deferred.reject(msg);
                    });
                deferred.resolve();
                // deferred.reject();
                return deferred.promise;
            },


            commitFormClick: function () {
                var deferred = Deferred();
                console.log("CONROLLER:commitPayClick()点击支付按钮");
                var that = vm;
                that.initcommitFormClick()
                    .then(function (userInfo) {
                        return that.getOrderByFrom(userInfo)
                    })
                    .otherwise(function (msg) {
                        avalon.log(msg)
                        deferred.reject(msg);
                    });
                deferred.resolve();
                // deferred.reject();
                return deferred.promise;
            },
            clearPayClick: function () {
                console.log("CONTROLLER:clearPay()点击清除金额");
                $("#pay").val("");
            },
            clearInsuranceNumberClick: function () {
                console.log("CONTROLLER:clearInsuranceNumber()点击清除会员号");
                $("#number").val("");
            },
            tipsClick: function () {
                console.log("CONTROLLER:tipsClick()点击隐藏提示");
                $("#tips").css("display", "none")
            }
        },
        //endregion

        //region 校验逻辑
        initcommitFormClick: function () {
            var deferred = Deferred();
            var that = this;
            var userInfo
            console.log("CONTROLLER:commitFormClick()点击支付按钮");
            that.userInfo.policyType = $('#Insurance_type').val();
            that.userInfo.numNo = $('#number').val();
            that.userInfo.insured = $('#select').val();
            that.userInfo.amount = $('#pay').val();
            if (that.userInfo.policyType == "请选择") {
                that.tips_msg("请选择保单类型");
                return false
            } else if (that.userInfo.numNo == "") {
                that.tips_msg("请输入会员号或保单号");
                return false
            }
            else if (that.userInfo.insured == "") {
                that.tips_msg("被保人名称不能为空");
                return false
            }
            else if (that.userInfo.amount == "") {
                that.tips_msg("请输入正确的支付金额");
                return false
            } else {
                userInfo = that.userInfo
            }
            deferred.resolve(userInfo);
            // deferred.reject();
            return deferred.promise;
        },
        //endregion 校验逻辑

        //region 主要逻辑
        post: function (interfaceName, data) {
            var deferred = Deferred();
            $.ajax({
                url: "/copay/" + interfaceName,
                type: 'post',
                timeout: 180000,
                data: data,
                dataType: 'json',
                success: function (data) {
                    deferred.resolve(data);
                },
                error: function (res, error) {
                    deferred.reject(res);
                }
            });
            return deferred.promise
        },
        getOrderByFrom: function (userInfo) {
            var deferred = Deferred();
            var that = this;
            $('#type').text(userInfo.policyType);
            $('#InsureNumber').text(userInfo.numNo);
            $('#InsureName').text(userInfo.holder);
            $('#payment').text(userInfo.amount);
            $("#preview").css("display", "block");
            var insured = $('#select option:selected').text();
            that.getSelectMyOrderIndex = $('#select option:selected').val();//获取选择对应的下标
            recognizeeName.innerHTML = insured;
            that.userInfo.insured = insured;
            deferred.resolve();
            // deferred.reject();
            return deferred.promise;
        },
        EncryptedInsuredPerson: function (userInfo) {
            var deferred = Deferred();
            console.log("CONTROLLER:EncryptedInsuredPerson()对被保人姓名加密");
            var patt = new RegExp(/^[\u4e00-\u9fa5]{2,}$/);//验证只能中文输入
            var that = this;
            var nameEncrypted = userInfo.insured;
            if (nameEncrypted) {
                if (nameEncrypted.insured instanceof Array) {
                    for (var i = 0; i < nameEncrypted.insured.length; i++) {
                        if (nameEncrypted.insured[i]) {
                            if (nameEncrypted.insured[i].length > 2) {
                                console.log("被保人姓名长度大于2" + nameEncrypted.insured[i]);
                                for (var j = 0; j < nameEncrypted.insured[0].length; j++) {
                                    var last = nameEncrypted.insured[i].length - 1;
                                    if (j > 0 && j < last) {
                                        if (patt.test(nameEncrypted.insured[i])) {
                                            if (last >= 2) {
                                                alert(i)
                                                alert(last)
                                                nameEncrypted.insured[i] = nameEncrypted.insured[i][0] + "**" + nameEncrypted.insured[i][last-1];
                                            } else {
                                                nameEncrypted.insured[i] = nameEncrypted.insured[i][0] + "*" + nameEncrypted.insured[i][last-1];
                                            }
                                        } else {
                                        }
                                    }
                                }
                            } else {
                                console.log("被保人姓名长度小于2" + nameEncrypted.insured[i]);
                                if (patt.test(nameEncrypted.insured[i])) {
                                    nameEncrypted.insured[i] = "*" + nameEncrypted.insured[i][1];
                                } else {
                                }
                                console.log("获取加密的被保人姓名");
                                console.log(nameEncrypted);
                            }
                        }
                    }
                    userInfo.insured = nameEncrypted;
                    deferred.resolve(userInfo);
                } else {
                    if (nameEncrypted.insured.length == 2) {
                        nameEncrypted.insured = "*" + nameEncrypted.insured[1];
                    } else if (nameEncrypted.insured.length == 3) {
                        nameEncrypted.insured = nameEncrypted.insured[0] + "*" + nameEncrypted.insured[2];
                    } else {
                        nameEncrypted.insured = nameEncrypted.insured[0] + "**" + nameEncrypted.insured[nameEncrypted.insured.length-1];
                    }
                    userInfo.insured = nameEncrypted;
                    deferred.resolve(userInfo);
                }
            } else {
                userInfo.insured = nameEncrypted;
                deferred.resolve(userInfo);
            }
            return deferred.promise;
        },
        getUserInfo: function (userInfo) {
            console.log("CONTROLLER:getUserInfo()获取被保人姓名");
            var deferred = Deferred();
            var that = this;
            var dataToPost = {
                policyType: userInfo.policyType,
                numNo: userInfo.numNo
            };
            that.post("getInfo", dataToPost)
                .then(function (data) {
                    if (data.respCode == '00') {
                        userInfo.holder = data.respData.holder;
                        userInfo.insured = data.respData.insured;
                        deferred.resolve(userInfo)
                    } else if (data.respCode == '01') {
                        that.tips_msg(data.respDesc);
                        userInfo.insured = data.respData;
                        deferred.resolve(userInfo)
                    } else {
                        that.tips_msg('暂未查询到相关信息');
                        that.userInfo.holder = '';
                        that.userInfo.insured = '';
                        $("#policy_name").val('');
                        $("#select").val('');
                        deferred.reject('暂未查询到相关信息')
                    }
                })
                .otherwise(function (msg) {
                    deferred.reject(msg);
                });
            return deferred.promise;
        },
        submitInfo: function (userInfo) {
            console.log("CONTROLLER:submitInfo()点击提交调用的数据");
            var deferred = Deferred();
            var that = vm;
            console.log(userInfo.insured);
            var dataToPost = {
                policyType:userInfo.policyType,
                numNo: userInfo.numNo,
                holder: userInfo.holder,
                insured: userInfo.insured[that.getSelectMyOrderIndex],
                amount: userInfo.amount
            };
            console.log(dataToPost);
            that.post("submitInfo", dataToPost)
                .then(function (data) {
                    if (data.respCode == '00') {
                        location.href = data.respData;
                        console.log("submitInfo:success");
                        deferred.resolve()
                    } else {
                        console.log("submitInfo:fail");
                        document.getElementById("preview").style.display = 'none';
                        that.tips_msg(data.respDesc);
                        deferred.reject(data.respDesc)
                    }
                })
                .otherwise(function (res) {
                    console.log("submitInfo:fail");
                    document.getElementById("preview").style.display = 'none';
                    deferred.reject(data.respDesc);
                });


            // deferred.reject();
            return deferred.promise;
        },
        initGetUserInfoToUi: function (userInfo) {
            var deferred = Deferred();
            console.log("CONTROLLER:initGetUserInfoToUi()赋值前的数据");
            var name = userInfo;
            console.log(name);
            var sel = document.getElementById("select");
            sel.innerHTML = '';
            var option = '';
            if (name) {
                if (name.insured instanceof Array) {
                    for (var i = 0; i < name.insured.length; i++) {
                        option = new Option(name.insured[i], i);
                        option.value = i;
                        sel.options.add(option);
                    }
                } else {
                    option = new Option(name.insured, 0);
                    option.value = 0;
                    sel.options.add(option);
                }
            }
            $('#policy_name').val(name.holder);
            deferred.resolve();
            // deferred.reject();
            return deferred.promise;
        },
        //endregion 主要逻辑

        //region 数据监听
        InsuranceTypechange: function (userInfo) {
            var deferred = Deferred();
            var Insuranceype = $('#Insurance_type').val();
            if (Insuranceype == '高端医疗险') {
                userInfo.policyType = 'GHB'
            } else if (Insuranceype == '团体医疗险') {
                userInfo.policyType = 'NGB'
            } else if (Insuranceype == '个人高端医疗险') {
                userInfo.policyType = 'IPMI'
            }
            console.log("CONTROLLER:InsuranceTypechange()监听保单类型");
            console.log(userInfo)
            deferred.resolve(userInfo);
            return deferred.promise;
        },

        numberFilling: function (userInfo) {
            var deferred = Deferred();
            console.log("CONTROLLER:numberFilling()监听会员号或保单号");
            var number = $("#number").val();
            if (number != "") {
                $("#clearInsuranceNumber").css("display", "block")
            } else {
                $("#clearInsuranceNumber").css("display", "none")
            }
            userInfo.numNo = number;
            deferred.resolve(userInfo);
            return deferred.promise;
        },

        //endregion 数据监

        //region 辅助函数
        keepOnlyNumber: function (value) {
            console.log("CONTROLLER:keepOnlyNumber()只能输入数字和小数点");
            value = value.toString();
            var newstr;
            // var regexp = /[^\d]]*/g;
            var regexp = /[^0-9\/.]*/g;
            newstr = value.replace(regexp, "");
            return newstr
        },
        tips_msg: function (value) {
            console.log("CONTROLLER:tips_msg()显示隐藏弹窗");
            $("#msg").text(value);
            $("#tips").css("display", "block");
            setTimeout(function () {
                document.getElementById("tips").style.display = 'none';
            }, 3000)
        }
        //endregion 辅助函数


    };

    //region 绑定输入框改变监听
    $("#Insurance_type").change(function () {
        $("#number").val('');
        $("#policy_name").val('');
        $("#select").val('');
        $('#pay').val('')
    });
    $("#number").change(function () {
        var that = vm;
        console.log("CONTROLLER:clearnumber()强制先选择报单类型");
        console.log(that.userInfo);
        var Insuranceype = $('#Insurance_type').val();
        if (Insuranceype == '请选择') {
            vm.tips_msg("请先选择保单类型");
            $("#number").val('')
        } else {
            console.log("CONTROLLER:InsuranceType()输入框失去焦点后调用接口");
            vm.InsuranceTypechange(that.userInfo)
                .then(function (userInfo) {
                    return vm.numberFilling(userInfo)
                })
                .then(function (userInfo) {
                    if (userInfo.numNo && userInfo.policyType) {
                        return vm.getUserInfo(userInfo)
                    }
                })
                // .then(function (userInfo) {
                //     return vm.EncryptedInsuredPerson(userInfo)
                // })
                .then(function (userInfo) {
                    return vm.initGetUserInfoToUi(userInfo)
                })
                .otherwise(function (msg) {
                    console.log(msg);
                });

        }

    });
    $("#pay").change(function () {
        console.log("CONTROLLER:PayrChange()监听金额变化");
        var that = vm;
        var pay = $("#pay").val();
        pay = that.keepOnlyNumber(pay);
        $("#pay").val(pay);
        if (pay != "") {
            $("#clearPay").css("display", "block")
        } else {
            $("#clearPay").css("display", "none")

        }
    });
    //endregion 绑定输入框改变监听

});


