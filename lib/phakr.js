

/**
* @author       Austen Higgins-Cassidy <plasmarobo@gmail.com>
* @copyright    2020 Millibyte Studios
* @license      {@link https://github.com/photonstorm/phaser3-plugin-template/blob/master/LICENSE|MIT License}
*/
import { Components } from './components.js'
import { EntityManager } from './entity_manager.js'

export class PhakrSystem
{
    constructor(core, components)
    {
        this.core = core
        this.components = new Components(components)
    }

    update(time, delta_t, entity) {}

    onRegister() {}
}

export var PhakrPlugin = function(scene)
{
    this.scene = scene
    this._systems = []

    this.ecsmanager = null
    if (!scene.sys.settings.isBooted)
    {
        scene.sys.events.once('boot', this.boot, this)
    }
}

PhakrPlugin.register = function (PluginManager)
{
    PluginManager.register('PhakrPlugin', PhakrPlugin, 'phakr')
}

PhakrPlugin.prototype = {
    boot: function()
    {
        var eventEmitter = this.scene.sys.events
        eventEmitter.on('update', this.update, this)
        eventEmitter.on('shutdown', this.shutdown, this)
        eventEmitter.on('destroy', this.destroy, this)
    },

    //  Called every Scene step - phase 2
    update: function(time, delta)
    {
        for (let system of this._systems)
        {
            var entities = this.queryEntities(system.components)
            for(var entity of entities)
            {
                system.update(time, delta, entity)
            }
        }
    },
    //  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
    shutdown: function()
    {
    },

    destroy: function()
    {
        this.shutdown();

        this.scene = undefined;
    },

    setComponents: function(component_list)
    {
        var count = component_list.length

        var Cs = new Array(count)
        for (var i = 0; i < Cs.length; i++) {
            Cs[i] = component_list[i]
        }

        var components = new Components(Cs)
        this.ecsmanager = new EntityManager(components)
    },

    createEntity: function(components)
    {
        let e = this.ecsmanager.create()
        let Cs = new Array(components)
        for(var i = 0; i < Cs.length; i++)
        {
            e.add(components[i])
        }

        return e
    },

    queryEntities: function(components)
    {
        return this.ecsmanager.query(components)
    },

    getEntity: function(id)
    {
        return this.ecsmanager.get(id)
    },

    valid: function(id)
    {
        return this.ecsmanager.valid(id)
    },

    registerSystem: function(system)
    {
        if (this._systems.indexOf(system) >= 0) {
            throw "Cannot register a system twice"
        }

        this._systems.push(system)

        system.onRegister();
    },

    clearSystems: function()
    {
        this._systems.clear()
    }
}

PhakrPlugin.prototype.constructor = PhakrPlugin;
