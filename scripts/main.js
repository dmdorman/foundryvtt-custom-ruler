Hooks.on("init", function() {
    CMT.initialize()

    CMT.log(false, 'hello world!')
});


Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(CMT.ID);
});

Hooks.on("getSceneControlButtons", (controls) => {
    // CMT.log(false, "--------------------------------");
    // CMT.log(false, "getSceneControlButtons");
    // CMT.log(false, controls)
    // CMT.log(false, controls.filter(e => e.name === "token"))
    // CMT.log(false, controls.filter(e => e.name === "token")[0].tools)
    // CMT.log(false, controls.filter(e => e.name === "token")[0].tools.filter(e => e.name === "ruler"))

    // CMT.log(false, game)

    // CMT.log(false, "--------------------------------");

});

Hooks.on("renderApplication", (controls, ...args) => {
    CMT.log(false, "renderApplication");

    CMT.log(false, controls.tool)
    if (controls.tool === "ruler") {
        // render selector
        CMTForm.cmtForm.render(true, {userId})
    }
});

/*
Hooks.once("init", () => {
    Ruler.prototype._getSegmentLabel = function _getSegmentLabel(segmentDistance, totalDistance, isTotal) {
        let rangeMod = Math.ceil(Math.log2(totalDistance / 8)) * 2;

        rangeMod = rangeMod < 0 ? 0: rangeMod;

        let label = "[" + Math.round(segmentDistance.distance) + " m]" +  "\n-" + rangeMod + " Range Modifier"

        return label
    };
})
*/

/*
Hooks.on("getSceneControlButtons", (controls) => {
    controls[0].tools.push({
    name: 'measure',
    title: 'Velocity Tracker',
    icon: 'far fa-right',
    button: true,
    //onClick: () => new VelocityTracker().render(true),
    onClick: () => {
        const userId = game.userId;
        VelocityTrackerList.velocityTracker.render(true, {userId})
    },
    visible: true
    })
});
*/

class CMT {
    static initialize() {
        this.cmtForm = new CMTForm()

        /*
        // gm can see all velocity trackers
        game.settings.register(this.ID, this.SETTINGS.GM_CAN_SEE_ALL, {
            name: `VELOCITY-TRACKER.settings.${this.SETTINGS.GM_CAN_SEE_ALL}.Name`,
            default: true,
            type: Boolean,
            scope: 'world',
            config: true,
            hint: `VELOCITY-TRACKER.settings.${this.SETTINGS.GM_CAN_SEE_ALL}.Hint`,
            onChange: () => ui.players.render()
        })

        // distance units setting
        game.settings.register(this.ID, this.SETTINGS.DISTANCE_UNITS, {
            name: `VELOCITY-TRACKER.settings.${this.SETTINGS.DISTANCE_UNITS}.Name`,
            default: "m/s",
            type: String,
            scope: 'world',
            config: true,
            hint: `VELOCITY-TRACKER.settings.${this.SETTINGS.DISTANCE_UNITS}.Hint`,
            onChange: () => ui.players.render()
        })

        // time units setting
        game.settings.register(this.ID, this.SETTINGS.TIME_UNITS, {
            name: `VELOCITY-TRACKER.settings.${this.SETTINGS.TIME_UNITS}.Name`,
            default: "m/s",
            type: String,
            scope: 'world',
            config: true,
            hint: `VELOCITY-TRACKER.settings.${this.SETTINGS.TIME_UNITS}.Hint`,
            onChange: () => ui.players.render()
        })

        // default action time
        game.settings.register(this.ID, this.SETTINGS.DEFAULT_ACTION_TIME, {
            name: `VELOCITY-TRACKER.settings.${this.SETTINGS.DEFAULT_ACTION_TIME}.Name`,
            default: 1,
            type: Number,
            scope: 'world',
            config: true,
            hint: `VELOCITY-TRACKER.settings.${this.SETTINGS.DEFAULT_ACTION_TIME}.Hint`,
            onChange: () => ui.players.render()
        })

        // default acceleration
        game.settings.register(this.ID, this.SETTINGS.DEFAULT_ACCELERATION, {
            name: `VELOCITY-TRACKER.settings.${this.SETTINGS.DEFAULT_ACCELERATION}.Name`,
            default: 0,
            type: Number,
            scope: 'world',
            config: true,
            hint: `VELOCITY-TRACKER.settings.${this.SETTINGS.DEFAULT_ACCELERATION}.Hint`,
            onChange: () => ui.players.render()
        })
        */
    }

    static ID = 'custom-measure-tool';

    static FLAGS = {
        CUSTOMMEASURETOOL: 'custom-measure-tool'
    }

    static TEMPLATES = {
        CMT: `./modules/${this.ID}/templates/custom-measure-tool.hbs`
    }

    static SETTINGS = {
        /*
        DISTANCE_UNITS: 'distance-units',
        TIME_UNITS: 'time-units',
        DEFAULT_ACTION_TIME: 'default-action-time',
        DEFAULT_ACCELERATION: 'default-acceleration',
        GM_CAN_SEE_ALL: 'gm-can-see-all'
        */
    }

    static log(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
}

class CMTForm extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 1000,
            id: CMT.id,
            template: CMT.TEMPLATES.CMT,
            title: "CUSTOM-MEASURE-TOOL.title",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData(options) {
        // const otherVelocityTrackers = game.users.current?.isGM && game.settings.get(VelocityTrackerList.ID, VelocityTrackerList.SETTINGS.GM_CAN_SEE_ALL)
        // ? VelocityTrackerData.otherVelocityTrackers(options.userId) : {}

        // return {
        //     velocitytrackers: VelocityTrackerData.getVelocityTrackersForUser(options.userId),
        //     distanceUnits: game.settings.get(VelocityTrackerList.ID, VelocityTrackerList.SETTINGS.DISTANCE_UNITS),
        //     timeUnits: game.settings.get(VelocityTrackerList.ID, VelocityTrackerList.SETTINGS.TIME_UNITS),
        //     otherVelocityTrackers: otherVelocityTrackers
        // }
    }

    async _updateObject(event, formData) {
        //const expandedData = foundry.utils.expandObject(formData);

        // await VelocityTrackerData.updateUserVelocityTrackers(this.options.userId, expandedData);

        this.render();
    }

    activateListeners(html) {
        super.activateListeners(html);

        // html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    // async _handleButtonClick(event) {
    //     const clickedElement = $(event.currentTarget);
    //     const action = clickedElement.data().action;
    //     const velocityTrackerId = clickedElement.parents('[data-velocity-tracker-id]')?.data()?.velocityTrackerId;

    //     switch(action) {
    //         case 'create': {
    //             await VelocityTrackerData.createVelocityTracker(this.options.userId);
    //             this.render();
    //             break;
    //         }

    //         case 'delete': {
    //             const confirmed = await Dialog.confirm({
    //                 title: game.i18n.localize("VELOCITY-TRACKER.confirms.deleteConfirm.Title"),
    //                 content: game.i18n.localize("VELOCITY-TRACKER.confirms.deleteConfirm.Content")
    //             });

    //             if (confirmed) {
    //                 await VelocityTrackerData.deleteVelocityTracker(velocityTrackerId);
    //                 this.render();
    //             }

    //             break;
    //         }

    //         case 'progress': {
    //             const relevantVelocityTracker = VelocityTrackerData.allVelocityTrackers[velocityTrackerId];

    //             const actionTime = (relevantVelocityTracker.actionTime.includes("/")) ? eval(1/eval(relevantVelocityTracker.actionTime)) : eval(relevantVelocityTracker.actionTime);

    //             const elapsedTime = relevantVelocityTracker.elapsedTime + actionTime;

    //             let newVelocity = Math.round((relevantVelocityTracker.movementAction / actionTime) + 
    //                 (relevantVelocityTracker.acceleration * elapsedTime**2));

    //             if (relevantVelocityTracker.maxVelocity !== null) newVelocity = minAbsoluteValue(eval(relevantVelocityTracker.maxVelocity), newVelocity);

    //             const update = {
    //                 ["elapsedTime"]: elapsedTime,
    //                 ["currentVelocity"]: newVelocity
    //             };

    //             VelocityTrackerData.updateVelocityTracker(relevantVelocityTracker.id, update);

    //             this.render();
        
    //             break;
    //         }

    //         default:
    //             VelocityTrackerList.log(false, 'Invalid action detected', action)
    //     }
    // }
}